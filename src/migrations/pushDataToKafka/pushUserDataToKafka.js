require('module-alias/register')
require('dotenv').config({ path: '../../.env' })

// Initialize Kafka client
require('../../configs/kafka')()

// External dependencies
const minimist = require('minimist')
const axios = require('axios')

// Internal helper for Kafka broadcasting
const { eventBroadcasterKafka } = require('../../helpers/eventBroadcasterMain')
const { Client } = require('pg')

/**
 * Parses a PostgreSQL connection URL into a config object
 */
function parseDbUrl(url) {
	const { URL } = require('url')
	const dbUrl = new URL(url)
	return {
		user: dbUrl.username,
		password: dbUrl.password,
		host: dbUrl.hostname,
		port: dbUrl.port,
		database: dbUrl.pathname.slice(1),
		ssl: dbUrl.searchParams.get('sslmode') === 'require',
	}
}

/**
 * Fetches user details, along with associated organization and role information
 */
async function fetchUserOrgRoles(client, userId) {
	const query = `
        SELECT 
            u.id AS user_id,
            u.name AS user_name,
            u.username,
            u.email,
            u.phone,
            u.tenant_code AS user_tenant_code,
            u.status AS user_status,
            u.meta AS user_meta,
            u.created_at AS user_created_at,
            u.updated_at AS user_updated_at,
            u.deleted_at AS user_deleted_at,
            u.deleted_at IS NOT NULL AS deleted,

            org.id AS org_id,
            org.name AS org_name,
            org.code AS org_code,
            org.description AS org_description,
            org.status AS org_status,
            org.related_orgs,
            org.tenant_code AS org_tenant_code,
            org.meta,
            org.created_by AS org_created_by,
            org.updated_by AS org_updated_by,

            r.id AS role_id,
            r.title AS role_title,
            r.label AS role_label,
            r.user_type,
            r.status AS role_status,
            r.organization_id AS role_org_id,
            r.visibility,
            r.tenant_code AS role_tenant_code,
            r.translations
        FROM 
            users u
        JOIN user_organizations uo 
            ON u.id = uo.user_id AND u.tenant_code = uo.tenant_code
        JOIN organizations org 
            ON org.code = uo.organization_code AND org.tenant_code = uo.tenant_code
        JOIN user_organization_roles uor 
            ON u.id = uor.user_id AND uor.organization_code = org.code AND uor.tenant_code = u.tenant_code
        JOIN user_roles r 
            ON r.id = uor.role_id AND r.tenant_code = u.tenant_code
        WHERE u.id = $1
    `
	const result = await client.query(query, [userId])
	return result.rows
}

/**
 * Builds a Kafka-compatible event object from user-org-role data
 */
function buildKafkaEvent(userRows) {
	if (userRows.length === 0) return null

	const first = userRows[0]
	const orgMap = new Map()

	// Group roles under their respective organizations
	for (const row of userRows) {
		if (!orgMap.has(row.org_id)) {
			orgMap.set(row.org_id, {
				id: row.org_id,
				name: row.org_name,
				code: row.org_code,
				description: row.org_description,
				status: row.org_status,
				related_orgs: row.related_orgs,
				tenant_code: row.org_tenant_code,
				meta: row.meta,
				created_by: row.org_created_by,
				updated_by: row.org_updated_by,
				roles: [],
			})
		}

		orgMap.get(row.org_id).roles.push({
			id: row.role_id,
			title: row.role_title,
			label: row.role_label,
			user_type: row.user_type,
			status: row.role_status,
			organization_id: row.role_org_id,
			visibility: row.visibility,
			tenant_code: row.role_tenant_code,
			translations: row.translations,
		})
	}

	// Determine event type based on timestamps and soft deletion
	let eventType = 'update'
	if (first.user_deleted_at) {
		eventType = 'delete'
	} else if (first.user_created_at && first.user_created_at.getTime() === first.user_updated_at.getTime()) {
		eventType = 'create'
	}

	return {
		entity: 'user',
		eventType: eventType,
		entityId: first.user_id,
		changes: {},
		created_by: first.user_id,
		name: first.user_name,
		username: first.username,
		email: first.email,
		phone: first.phone,
		organizations: Array.from(orgMap.values()),
		tenant_code: first.user_tenant_code,
		status: first.user_status,
		deleted: first.deleted,
		id: first.user_id,
		meta: first.user_meta,
		created_at: first.user_created_at,
		updated_at: first.user_updated_at,
		deleted_at: first.user_deleted_at,
	}
}

/**
 * Fetches entity metadata from external service using ID and tenantCode
 */
async function fetchEntityDetail(id, tenantCode) {
	try {
		if (id && Array.isArray(id) && id.length > 0) {
			id = {
				$in: id,
			}
		}
		const projection = ['_id', 'metaInformation']
		let requestJSON = {
			query: { _id: id, tenantId: tenantCode },
			projection: projection,
		}
		const options = {
			headers: {
				'content-type': 'application/json',
				'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
			},
		}
		const response = await axios.post(
			`${process.env.ENTITY_MANAGEMENT_SERVICE_BASE_URL}/v1/entities/find`,
			requestJSON,
			options
		)
		const entity = response.data?.result?.[0]
		if (!entity) throw new Error(`Entity not found for id: ${id}`)

		return {
			id: entity._id,
			name: entity.metaInformation.name,
			externalId: entity.metaInformation.externalId,
		}
	} catch (error) {
		console.error('Axios Error:', error.response?.data?.message || error.message)
	}
}

/**
 * Replaces location-related metadata in the event with enriched details
 */
async function enrichLocationFields(event) {
	const meta = event.meta
	if (!meta) return event

	const locationKeys = [
		'state',
		'district',
		'block',
		'cluster',
		'school',
		'professional_role',
		'professional_subroles',
	]
	const tenantCode = event.tenant_code
	for (const key of locationKeys) {
		const value = meta[key]

		if (!value) continue

		try {
			if (Array.isArray(value)) {
				event[key] = await Promise.all(value.map((id) => fetchEntityDetail(id, tenantCode)))
			} else {
				event[key] = await fetchEntityDetail(value, tenantCode)
			}
		} catch (err) {
			console.warn(`Failed to fetch ${key} details:`, err.message)

			// Set to [{}] for arrays, {} otherwise
			if (Array.isArray(value)) {
				event[key] = value.map(() => ({}))
			} else {
				event[key] = {}
			}
		}
	}

	delete event.meta
	return event
}

// Main execution block
;(async () => {
	// Parse command line arguments
	const argv = minimist(process.argv.slice(2))
	const fromDate = new Date(`${argv.from}T00:00:00Z`)
	const toDate = new Date(`${argv.to}T23:59:59Z`) // End of the day
	const dbUrl = process.env.DEV_DATABASE_URL

	// Validate input
	if (!fromDate || !toDate) {
		console.error('Usage: node script.js --from=<fromTime> --to=<toTime>')
		process.exit(1)
	}

	if (isNaN(fromDate) || isNaN(toDate)) {
		console.error('Invalid date provided. Example :- "2025-07-01"')
		process.exit(1)
	}

	// Setup DB connection
	const dbConfig = parseDbUrl(dbUrl)
	const client = new Client(dbConfig)

	try {
		await client.connect()

		// Query user IDs updated within the specified range
		const userQuery = `
            SELECT id FROM users 
            WHERE updated_at BETWEEN $1 AND $2
        `
		const res = await client.query(userQuery, [fromDate.toISOString(), toDate.toISOString()])
		const userIds = res.rows.map((r) => r.id)

		console.log(`Found ${userIds.length} users\n`)

		let successCount = 0
		let errorCount = 0

		// Process each user
		for (const userId of userIds) {
			try {
				const userData = await fetchUserOrgRoles(client, userId)
				let kafkaEvent = buildKafkaEvent(userData)

				if (!kafkaEvent) {
					console.warn(`No org-role data for user ${userId}, skipping`)
					continue
				}

				kafkaEvent = await enrichLocationFields(kafkaEvent)

				// Send event to Kafka
				eventBroadcasterKafka('userEvents', {
					requestBody: kafkaEvent,
				})

				console.log(`Pushed user ${userId}`)
				successCount++
			} catch (err) {
				console.error(`Failed to push user ${userId}:`, err.message)
				errorCount++
			}
		}

		// Summary
		console.log(`\nDone. Total: ${userIds.length}, Success: ${successCount}, Failed: ${errorCount}`)
	} catch (err) {
		console.error('Unexpected Error:', err)
	} finally {
		await client.end()
		process.exit(0)
	}
})()
