'use strict'

require('module-alias/register')

const path = require('path')
const minimist = require('minimist')
const axios = require('axios')
const { Sequelize, QueryTypes, Transaction } = require('sequelize')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const DEFAULTS = {
	roleResolution: 'strict-id',
	strictIdRebase: 'if-target-tenant-empty',
	deleteMode: 'soft',
	deleteScope: 'users-only',
	sessionMode: 'invalidate',
	lockStrategy: 'skip',
	dryRun: false,
}

const VALID_OPTIONS = {
	roleResolution: ['strict-id', 'map-by-title'],
	strictIdRebase: ['if-target-tenant-empty', 'never'],
	deleteMode: ['soft', 'hard', 'none'],
	deleteScope: ['users-only', 'all-copied'],
	sessionMode: ['invalidate', 'migrate'],
	lockStrategy: ['skip', 'advisory-only', 'advisory-table-lock'],
}

const ORG_TABLES = ['forms', 'entity_types', 'entities', 'notification_templates']
const USER_TABLES = ['users', 'user_organizations', 'user_organization_roles']
const EXTERNAL_FETCH_CHUNK_SIZE = 200
const EXTERNAL_FETCH_MAX_PARALLEL = 3
const EXTERNAL_FETCH_PAGE_LIMIT = 100

function log(level, event, data = {}) {
	console.log(
		JSON.stringify({
			ts: new Date().toISOString(),
			level,
			event,
			...data,
		})
	)
}

function parseBoolean(value, defaultValue = false) {
	if (value === undefined || value === null || value === '') {
		return defaultValue
	}
	if (typeof value === 'boolean') {
		return value
	}
	const normalized = String(value).trim().toLowerCase()
	if (['true', '1', 'yes', 'y'].includes(normalized)) {
		return true
	}
	if (['false', '0', 'no', 'n'].includes(normalized)) {
		return false
	}
	throw new Error(`Invalid boolean value: ${value}`)
}

function getOption(cliValue, envValue, fallback) {
	if (cliValue !== undefined && cliValue !== null && String(cliValue).trim() !== '') {
		return cliValue
	}
	if (envValue !== undefined && envValue !== null && String(envValue).trim() !== '') {
		return envValue
	}
	return fallback
}

function getNodeEnv() {
	return process.env.NODE_ENV || process.env.APPLICATION_ENV || 'development'
}

function getDatabaseUrl(nodeEnv) {
	switch (nodeEnv) {
		case 'production':
			return process.env.PROD_DATABASE_URL || process.env.DATABASE_URL
		case 'test':
			return process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
		default:
			return process.env.DEV_DATABASE_URL || process.env.DATABASE_URL
	}
}

function printUsage() {
	console.log(`
Usage:
  node scripts/migrateTenantOrgData.js --current-tenant-code=<sourceTenant> --current-org-code=<orgCode> --new-tenant-code=<targetTenant> [options]

Required:
  --current-tenant-code
  --current-org-code
  --new-tenant-code

Optional:
  --role-resolution=strict-id|map-by-title             (default: strict-id)
  --strict-id-rebase=if-target-tenant-empty|never     (default: if-target-tenant-empty)
  --delete-mode=soft|hard|none                        (default: soft)
  --delete-scope=users-only|all-copied                (default: users-only)
  --session-mode=invalidate|migrate                   (default: invalidate)
  --lock-strategy=skip|advisory-only|advisory-table-lock (default: skip)
  --dry-run=true|false                                (default: false)
  --help
`)
}

function normalizeAndValidateOptions(rawOptions) {
	const normalized = {
		currentTenantCode: String(rawOptions.currentTenantCode || '').trim(),
		currentOrgCode: String(rawOptions.currentOrgCode || '').trim(),
		newTenantCode: String(rawOptions.newTenantCode || '').trim(),
		roleResolution: String(rawOptions.roleResolution || DEFAULTS.roleResolution)
			.trim()
			.toLowerCase(),
		strictIdRebase: String(rawOptions.strictIdRebase || DEFAULTS.strictIdRebase)
			.trim()
			.toLowerCase(),
		deleteMode: String(rawOptions.deleteMode || DEFAULTS.deleteMode)
			.trim()
			.toLowerCase(),
		deleteScope: String(rawOptions.deleteScope || DEFAULTS.deleteScope)
			.trim()
			.toLowerCase(),
		sessionMode: String(rawOptions.sessionMode || DEFAULTS.sessionMode)
			.trim()
			.toLowerCase(),
		lockStrategy: String(rawOptions.lockStrategy || DEFAULTS.lockStrategy)
			.trim()
			.toLowerCase(),
		dryRun: parseBoolean(rawOptions.dryRun, DEFAULTS.dryRun),
	}

	if (!normalized.currentTenantCode || !normalized.currentOrgCode || !normalized.newTenantCode) {
		throw new Error('Missing required args: current-tenant-code, current-org-code, new-tenant-code')
	}

	if (normalized.currentTenantCode === normalized.newTenantCode) {
		throw new Error('current-tenant-code and new-tenant-code must be different')
	}

	Object.keys(VALID_OPTIONS).forEach((key) => {
		if (!VALID_OPTIONS[key].includes(normalized[key])) {
			throw new Error(`Invalid ${key}: ${normalized[key]}. Allowed: ${VALID_OPTIONS[key].join(', ')}`)
		}
	})

	return normalized
}

async function querySelect(sequelize, sql, bind, transaction) {
	return sequelize.query(sql, {
		type: QueryTypes.SELECT,
		bind,
		transaction,
	})
}

async function queryRaw(sequelize, sql, bind, transaction) {
	return sequelize.query(sql, {
		bind,
		transaction,
	})
}

function assertOrThrow(condition, message, details = {}) {
	if (!condition) {
		const error = new Error(message)
		error.details = details
		throw error
	}
}

function mapRoleArray(roles, roleMap) {
	if (!Array.isArray(roles) || roles.length === 0) {
		return []
	}
	return roles.map((roleId) => {
		const mapped = roleMap.get(Number(roleId))
		if (!mapped) {
			throw new Error(`Role mapping missing for role id ${roleId}`)
		}
		return mapped
	})
}

function toNonEmptyString(value) {
	if (value === undefined || value === null) {
		return ''
	}
	const normalized = String(value).trim()
	return normalized
}

function isPlainObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function constructUrl(baseUrl, endPoint) {
	if (!baseUrl || !endPoint) {
		return baseUrl || endPoint || ''
	}
	const normalizedBase = String(baseUrl).replace(/\/+$/, '')
	const normalizedPath = String(endPoint).replace(/^\/+/, '')
	return `${normalizedBase}/${normalizedPath}`
}

function getExternalBaseUrl(service) {
	if (!service) {
		return ''
	}
	return (
		process.env?.[`${service.toUpperCase()}_BASE_URL`] ||
		process.env?.[`${service.replace(/-/g, '_').toUpperCase()}_BASE_URL`] ||
		''
	)
}

function chunkArray(input, size) {
	const chunks = []
	for (let i = 0; i < input.length; i += size) {
		chunks.push(input.slice(i, i + size))
	}
	return chunks
}

function getMetaIds(value) {
	if (value === undefined || value === null) {
		return []
	}
	if (Array.isArray(value)) {
		return value.flatMap((entry) => getMetaIds(entry))
	}
	if (isPlainObject(value)) {
		if (value._id !== undefined && value._id !== null && toNonEmptyString(value._id) !== '') {
			return [toNonEmptyString(value._id)]
		}
		if (value.id !== undefined && value.id !== null && toNonEmptyString(value.id) !== '') {
			return [toNonEmptyString(value.id)]
		}
		if (value.value !== undefined && value.value !== null && toNonEmptyString(value.value) !== '') {
			return [toNonEmptyString(value.value)]
		}
		return []
	}
	const normalized = toNonEmptyString(value)
	return normalized ? [normalized] : []
}

function remapMetaValue(value, idMap) {
	if (value === undefined || value === null) {
		return value
	}
	if (Array.isArray(value)) {
		return value.map((entry) => remapMetaValue(entry, idMap))
	}
	if (isPlainObject(value)) {
		if (value._id !== undefined && value._id !== null) {
			const key = toNonEmptyString(value._id)
			return key && idMap.has(key) ? { ...value, _id: idMap.get(key) } : value
		}
		if (value.id !== undefined && value.id !== null) {
			const key = toNonEmptyString(value.id)
			return key && idMap.has(key) ? { ...value, id: idMap.get(key) } : value
		}
		if (value.value !== undefined && value.value !== null) {
			const key = toNonEmptyString(value.value)
			return key && idMap.has(key) ? { ...value, value: idMap.get(key) } : value
		}
		return value
	}
	const key = toNonEmptyString(value)
	return key && idMap.has(key) ? idMap.get(key) : value
}

async function runInBatches(taskFactories, maxParallel) {
	if (taskFactories.length === 0) {
		return
	}
	let cursor = 0
	const workers = Array.from({ length: Math.min(maxParallel, taskFactories.length) }, async () => {
		while (cursor < taskFactories.length) {
			const currentIndex = cursor
			cursor += 1
			await taskFactories[currentIndex]()
		}
	})
	await Promise.all(workers)
}

async function lockByStrategy(sequelize, tx, options) {
	if (options.lockStrategy === 'skip') {
		return
	}

	const advisoryKey = `tenant-move:${options.currentTenantCode}:${options.currentOrgCode}:${options.newTenantCode}`
	await querySelect(sequelize, 'SELECT pg_advisory_xact_lock(hashtext($advisoryKey));', { advisoryKey }, tx)

	if (options.lockStrategy === 'advisory-table-lock') {
		await queryRaw(
			sequelize,
			`LOCK TABLE users, user_organizations, user_organization_roles, user_sessions, user_roles, organization_role_requests, forms, entity_types, entities, notification_templates, organizations IN SHARE ROW EXCLUSIVE MODE;`,
			{},
			tx
		)
	}
}

function keyForRole(title, orgCode) {
	return `${String(title || '')
		.trim()
		.toLowerCase()}|${String(orgCode || '')
		.trim()
		.toLowerCase()}`
}

async function loadExternalEntityTypeSpecs(sequelize, tx, context) {
	const { sourceTenant, orgCode, sourceOrg, sourceDefaultOrg, defaultOrgCode } = context
	const externalRows = await querySelect(
		sequelize,
		`SELECT id, value, data_type, meta, organization_code, organization_id
		 FROM entity_types
		 WHERE tenant_code = $sourceTenant
		   AND external_entity_type = TRUE
		   AND deleted_at IS NULL
		   AND status = 'ACTIVE'
		   AND organization_code = ANY($organizationCodes)
		   AND organization_id = ANY($organizationIds)
		 ORDER BY
		   CASE
		     WHEN organization_code = $orgCode THEN 0
		     WHEN organization_code = $defaultOrgCode THEN 1
		     ELSE 2
		   END,
		   id ASC;`,
		{
			sourceTenant,
			orgCode,
			defaultOrgCode,
			organizationCodes: [orgCode, defaultOrgCode],
			organizationIds: [Number(sourceOrg.id), Number(sourceDefaultOrg.id)],
		},
		tx
	)

	const sourceScopedCount = externalRows.filter((row) => row.organization_code === orgCode).length
	const defaultScopedCount = externalRows.filter((row) => row.organization_code === defaultOrgCode).length

	const externalEntityTypeSpecs = new Map()
	for (const row of externalRows) {
		const value = toNonEmptyString(row.value)
		assertOrThrow(!!value, 'External entity_type has empty value', {
			entityTypeId: row.id,
			organizationCode: row.organization_code,
		})

		if (externalEntityTypeSpecs.has(value)) {
			continue
		}

		const service = toNonEmptyString(row?.meta?.service)
		const endPoint = toNonEmptyString(row?.meta?.endPoint)
		assertOrThrow(!!service && !!endPoint, 'External entity_type meta.service/meta.endPoint missing', {
			entityTypeId: row.id,
			value,
			organizationCode: row.organization_code,
		})

		externalEntityTypeSpecs.set(value, {
			value,
			dataType: row.data_type,
			service,
			endPoint,
			sourceOrgScope: row.organization_code === orgCode ? 'source-org' : 'default-org',
		})
	}

	return {
		externalEntityTypeSpecs,
		externalMetaKeys: Array.from(externalEntityTypeSpecs.keys()),
		externalEntityTypeStats: {
			sourceScopedCount,
			defaultScopedCount,
			dedupedCount: externalEntityTypeSpecs.size,
		},
	}
}

async function fetchExternalMappingsForGroup(group, targetTenant) {
	const oldIds = Array.from(group.oldIds)
	if (oldIds.length === 0) {
		return new Map()
	}

	const externalBaseUrl = getExternalBaseUrl(group.service)
	assertOrThrow(!!externalBaseUrl, 'External base URL missing for service', {
		service: group.service,
	})
	const url = constructUrl(externalBaseUrl, group.endPoint)
	assertOrThrow(!!url, 'External URL construction failed', {
		service: group.service,
		endPoint: group.endPoint,
	})

	const headers = {
		'Content-Type': 'application/json',
		'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
	}

	const mappedIds = new Map()
	const chunks = chunkArray(oldIds, EXTERNAL_FETCH_CHUNK_SIZE)
	const taskFactories = chunks.map((chunk) => async () => {
		const normalizedChunk = chunk.map((id) => toNonEmptyString(id)).filter(Boolean)
		if (normalizedChunk.length === 0) {
			return
		}
		const requestBody = {
			query: {
				'metaInformation.tenantMigrationReferenceId': {
					$in: normalizedChunk,
				},
				tenantId: targetTenant,
			},
			projection: ['_id', 'metaInformation.tenantMigrationReferenceId'],
		}

		let page = 1
		let fetchedCount = 0
		let totalCount = null
		let hasMore = true
		while (hasMore) {
			let response = null
			try {
				response = await axios.post(url, requestBody, {
					headers,
					params: {
						page,
						limit: EXTERNAL_FETCH_PAGE_LIMIT,
					},
				})
			} catch (error) {
				throw Object.assign(new Error('External mapping API call failed'), {
					details: {
						service: group.service,
						endPoint: group.endPoint,
						url,
						page,
						limit: EXTERNAL_FETCH_PAGE_LIMIT,
						status: error?.response?.status || null,
						data: error?.response?.data || null,
						message: error.message,
					},
				})
			}

			const parsedCount = Number(response?.data?.count)
			if (Number.isFinite(parsedCount) && parsedCount >= 0) {
				totalCount = parsedCount
			}

			const result = Array.isArray(response?.data?.result) ? response.data.result : []
			if (result.length === 0) {
				hasMore = false
				continue
			}

			for (const item of result) {
				const oldId = toNonEmptyString(item?.metaInformation?.tenantMigrationReferenceId)
				const newId = toNonEmptyString(item?._id)
				if (!oldId || !newId) {
					continue
				}
				if (!group.oldIds.has(oldId)) {
					continue
				}
				if (mappedIds.has(oldId) && mappedIds.get(oldId) !== newId) {
					throw Object.assign(new Error('Ambiguous external mapping found for old id'), {
						details: {
							oldId,
							firstNewId: mappedIds.get(oldId),
							secondNewId: newId,
							service: group.service,
							endPoint: group.endPoint,
						},
					})
				}
				mappedIds.set(oldId, newId)
			}

			fetchedCount += result.length
			if (totalCount !== null && fetchedCount >= totalCount) {
				hasMore = false
				continue
			}
			if (result.length < EXTERNAL_FETCH_PAGE_LIMIT) {
				hasMore = false
				continue
			}
			page += 1
		}
	})

	await runInBatches(taskFactories, EXTERNAL_FETCH_MAX_PARALLEL)

	const missingIds = oldIds.filter((id) => !mappedIds.has(id))
	assertOrThrow(missingIds.length === 0, 'External id mapping missing for user meta references', {
		service: group.service,
		endPoint: group.endPoint,
		missingSample: missingIds.slice(0, 20),
		missingCount: missingIds.length,
	})

	return mappedIds
}

async function remapExternalMetaForUsers(context) {
	if (!context.externalEntityTypeSpecs || context.externalEntityTypeSpecs.size === 0) {
		return {
			usersForInsert: context.sourceUsers,
			stats: {
				affectedUsers: 0,
				referencesDetected: 0,
				referencesRemapped: 0,
				groups: 0,
			},
		}
	}

	const groups = new Map()
	const referencedIds = new Map()
	let referencesDetected = 0
	let affectedUsers = 0

	for (const user of context.sourceUsers) {
		if (!isPlainObject(user.meta)) {
			continue
		}

		let userHasExternalMeta = false
		for (const [metaKey, spec] of context.externalEntityTypeSpecs.entries()) {
			if (!Object.prototype.hasOwnProperty.call(user.meta, metaKey)) {
				continue
			}
			const ids = getMetaIds(user.meta[metaKey])
			if (ids.length === 0) {
				continue
			}

			userHasExternalMeta = true
			referencesDetected += ids.length
			referencedIds.set(metaKey, (referencedIds.get(metaKey) || 0) + ids.length)

			const groupKey = `${spec.service}|${spec.endPoint}`
			if (!groups.has(groupKey)) {
				groups.set(groupKey, {
					service: spec.service,
					endPoint: spec.endPoint,
					oldIds: new Set(),
				})
			}
			const group = groups.get(groupKey)
			ids.forEach((id) => group.oldIds.add(id))
		}

		if (userHasExternalMeta) {
			affectedUsers += 1
		}
	}

	if (groups.size === 0) {
		return {
			usersForInsert: context.sourceUsers,
			stats: {
				affectedUsers: 0,
				referencesDetected: 0,
				referencesRemapped: 0,
				groups: 0,
			},
		}
	}

	const mappingByGroup = new Map()
	for (const [groupKey, group] of groups.entries()) {
		const groupMap = await fetchExternalMappingsForGroup(group, context.targetTenant)
		mappingByGroup.set(groupKey, groupMap)
	}

	let referencesRemapped = 0
	const usersForInsert = context.sourceUsers.map((user) => {
		if (!isPlainObject(user.meta)) {
			return user
		}
		const nextMeta = { ...user.meta }
		let changed = false

		for (const [metaKey, spec] of context.externalEntityTypeSpecs.entries()) {
			if (!Object.prototype.hasOwnProperty.call(nextMeta, metaKey)) {
				continue
			}
			const groupKey = `${spec.service}|${spec.endPoint}`
			const groupMap = mappingByGroup.get(groupKey)
			assertOrThrow(!!groupMap, 'Missing external mapping group for meta key', {
				metaKey,
				groupKey,
			})

			const existingIds = getMetaIds(nextMeta[metaKey])
			existingIds.forEach((id) => {
				assertOrThrow(groupMap.has(id), 'Missing external mapping for meta id during remap', {
					metaKey,
					id,
					service: spec.service,
					endPoint: spec.endPoint,
				})
			})
			referencesRemapped += existingIds.length

			const remappedValue = remapMetaValue(nextMeta[metaKey], groupMap)
			nextMeta[metaKey] = remappedValue
			changed = true
		}

		return changed ? { ...user, meta: nextMeta } : user
	})

	return {
		usersForInsert,
		stats: {
			affectedUsers,
			referencesDetected,
			referencesRemapped,
			groups: groups.size,
			metaKeyReferenceCounts: Object.fromEntries(referencedIds),
		},
	}
}

async function buildContextAndPrecheck(sequelize, tx, options) {
	const sourceTenant = options.currentTenantCode
	const targetTenant = options.newTenantCode
	const orgCode = options.currentOrgCode
	const defaultOrgCode = toNonEmptyString(process.env.DEFAULT_ORGANISATION_CODE)
	assertOrThrow(!!defaultOrgCode, 'DEFAULT_ORGANISATION_CODE is required for external entity-type fallback detection')

	const sourceTenantRow = await querySelect(
		sequelize,
		'SELECT code FROM tenants WHERE code = $sourceTenant LIMIT 1;',
		{ sourceTenant },
		tx
	)
	const targetTenantRow = await querySelect(
		sequelize,
		'SELECT code FROM tenants WHERE code = $targetTenant LIMIT 1;',
		{ targetTenant },
		tx
	)
	assertOrThrow(sourceTenantRow.length === 1, 'Source tenant does not exist', { sourceTenant })
	assertOrThrow(targetTenantRow.length === 1, 'Target tenant does not exist', { targetTenant })

	const sourceOrgRows = await querySelect(
		sequelize,
		'SELECT id, code, tenant_code FROM organizations WHERE tenant_code = $sourceTenant AND code = $orgCode LIMIT 1;',
		{ sourceTenant, orgCode },
		tx
	)
	const targetOrgRows = await querySelect(
		sequelize,
		'SELECT id, code, tenant_code FROM organizations WHERE tenant_code = $targetTenant AND code = $orgCode LIMIT 1;',
		{ targetTenant, orgCode },
		tx
	)
	assertOrThrow(sourceOrgRows.length === 1, 'Source organization not found', { sourceTenant, orgCode })
	assertOrThrow(targetOrgRows.length === 1, 'Target organization with same code not found', { targetTenant, orgCode })
	const sourceDefaultOrgRows = await querySelect(
		sequelize,
		'SELECT id, code, tenant_code FROM organizations WHERE tenant_code = $sourceTenant AND code = $defaultOrgCode LIMIT 1;',
		{ sourceTenant, defaultOrgCode },
		tx
	)
	assertOrThrow(sourceDefaultOrgRows.length === 1, 'Default organization not found in source tenant', {
		sourceTenant,
		defaultOrgCode,
	})

	const sourceOrg = sourceOrgRows[0]
	const targetOrg = targetOrgRows[0]
	const sourceDefaultOrg = sourceDefaultOrgRows[0]

	const scopedUsers = await querySelect(
		sequelize,
		`SELECT DISTINCT user_id
		 FROM user_organizations
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode
		   AND deleted_at IS NULL;`,
		{ sourceTenant, orgCode },
		tx
	)

	const userIds = scopedUsers.map((row) => Number(row.user_id))
	assertOrThrow(userIds.length > 0, 'No users found in source tenant + organization', {
		sourceTenant,
		orgCode,
	})

	const crossOrgMembership = await querySelect(
		sequelize,
		`SELECT user_id, organization_code
		 FROM user_organizations
		 WHERE tenant_code = $sourceTenant
		   AND user_id = ANY($userIds)
		   AND organization_code <> $orgCode
		 LIMIT 20;`,
		{ sourceTenant, userIds, orgCode },
		tx
	)
	assertOrThrow(
		crossOrgMembership.length === 0,
		'Users belong to multiple organizations in source tenant. Aborting.',
		{
			sample: crossOrgMembership,
		}
	)

	const crossOrgRoles = await querySelect(
		sequelize,
		`SELECT user_id, organization_code, role_id
		 FROM user_organization_roles
		 WHERE tenant_code = $sourceTenant
		   AND user_id = ANY($userIds)
		   AND organization_code <> $orgCode
		 LIMIT 20;`,
		{ sourceTenant, userIds, orgCode },
		tx
	)
	assertOrThrow(
		crossOrgRoles.length === 0,
		'User roles exist outside source organization for scoped users. Aborting.',
		{
			sample: crossOrgRoles,
		}
	)

	const roleRequestRefs = await querySelect(
		sequelize,
		`SELECT id, requester_id, handled_by
		 FROM organization_role_requests
		 WHERE tenant_code = $sourceTenant
		   AND (requester_id = ANY($userIds) OR handled_by = ANY($userIds))
		 LIMIT 20;`,
		{ sourceTenant, userIds },
		tx
	)
	assertOrThrow(
		roleRequestRefs.length === 0,
		'Scoped users are referenced in organization_role_requests. Aborting.',
		{
			sample: roleRequestRefs,
		}
	)

	const targetUserIdCollision = await querySelect(
		sequelize,
		`SELECT id
		 FROM users
		 WHERE tenant_code = $targetTenant
		   AND id = ANY($userIds)
		 LIMIT 20;`,
		{ targetTenant, userIds },
		tx
	)
	assertOrThrow(targetUserIdCollision.length === 0, '(id, newTenantCode) already exists in target users', {
		sample: targetUserIdCollision,
	})

	const usernameCollision = await querySelect(
		sequelize,
		`SELECT su.id, su.username
		 FROM users su
		 JOIN users tu
		   ON tu.tenant_code = $targetTenant
		  AND tu.username = su.username
		 WHERE su.tenant_code = $sourceTenant
		   AND su.id = ANY($userIds)
		   AND su.username IS NOT NULL
		 LIMIT 20;`,
		{ sourceTenant, targetTenant, userIds },
		tx
	)
	assertOrThrow(usernameCollision.length === 0, 'Username conflict in target tenant', { sample: usernameCollision })

	const phoneCollision = await querySelect(
		sequelize,
		`SELECT su.id, su.phone
		 FROM users su
		 JOIN users tu
		   ON tu.tenant_code = $targetTenant
		  AND tu.phone = su.phone
		 WHERE su.tenant_code = $sourceTenant
		   AND su.id = ANY($userIds)
		   AND su.phone IS NOT NULL
		 LIMIT 20;`,
		{ sourceTenant, targetTenant, userIds },
		tx
	)
	assertOrThrow(phoneCollision.length === 0, 'Phone conflict in target tenant', { sample: phoneCollision })

	const sourceForms = await querySelect(
		sequelize,
		`SELECT id, type, sub_type
		 FROM forms
		 WHERE tenant_code = $sourceTenant
		   AND organization_id = $sourceOrgId;`,
		{ sourceTenant, sourceOrgId: sourceOrg.id },
		tx
	)

	const sourceEntityTypesMismatch = await querySelect(
		sequelize,
		`SELECT id
		 FROM entity_types
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode
		   AND organization_id <> $sourceOrgId
		 LIMIT 1;`,
		{ sourceTenant, orgCode, sourceOrgId: sourceOrg.id },
		tx
	)
	assertOrThrow(sourceEntityTypesMismatch.length === 0, 'entity_types org code/id mismatch in source scope', {})

	const defaultEntityTypesMismatch = await querySelect(
		sequelize,
		`SELECT id
		 FROM entity_types
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $defaultOrgCode
		   AND organization_id <> $sourceDefaultOrgId
		 LIMIT 1;`,
		{
			sourceTenant,
			defaultOrgCode,
			sourceDefaultOrgId: sourceDefaultOrg.id,
		},
		tx
	)
	assertOrThrow(
		defaultEntityTypesMismatch.length === 0,
		'entity_types org code/id mismatch in default-org fallback scope',
		{}
	)

	const sourceEntityTypes = await querySelect(
		sequelize,
		`SELECT id, parent_id, value, deleted_at
		 FROM entity_types
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode
		   AND organization_id = $sourceOrgId;`,
		{ sourceTenant, orgCode, sourceOrgId: sourceOrg.id },
		tx
	)

	const sourceEntityTypeIds = new Set(sourceEntityTypes.map((row) => Number(row.id)))
	const brokenParent = sourceEntityTypes.find(
		(row) => row.parent_id !== null && !sourceEntityTypeIds.has(Number(row.parent_id))
	)
	assertOrThrow(!brokenParent, 'entity_types parent_id points outside scoped source entity_types', {
		entityTypeId: brokenParent?.id,
		parentId: brokenParent?.parent_id,
	})

	const sourceEntities = await querySelect(
		sequelize,
		`SELECT id, entity_type_id, value, deleted_at
		 FROM entities
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode;`,
		{ sourceTenant, orgCode },
		tx
	)

	const entitiesOutsideEntityTypeScope = sourceEntities.find(
		(row) => !sourceEntityTypeIds.has(Number(row.entity_type_id))
	)
	assertOrThrow(
		!entitiesOutsideEntityTypeScope,
		'Entity references entity_type not present in scoped source entity_types',
		{
			entityId: entitiesOutsideEntityTypeScope?.id,
			entityTypeId: entitiesOutsideEntityTypeScope?.entity_type_id,
		}
	)

	const sourceNotificationTemplates = await querySelect(
		sequelize,
		`SELECT id, type, code
		 FROM notification_templates
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode;`,
		{ sourceTenant, orgCode },
		tx
	)

	const sourceFormIds = sourceForms.map((row) => Number(row.id))
	const sourceEntityTypeIdArray = sourceEntityTypes.map((row) => Number(row.id))
	const sourceEntityIds = sourceEntities.map((row) => Number(row.id))
	const sourceTemplateIds = sourceNotificationTemplates.map((row) => Number(row.id))

	if (sourceFormIds.length > 0) {
		const formPkCollision = await querySelect(
			sequelize,
			`SELECT id
			 FROM forms
			 WHERE tenant_code = $targetTenant
			   AND id = ANY($sourceFormIds)
			 LIMIT 20;`,
			{ targetTenant, sourceFormIds },
			tx
		)
		assertOrThrow(formPkCollision.length === 0, 'forms id collision in target tenant', { sample: formPkCollision })

		const formUniqueCollision = await querySelect(
			sequelize,
			`SELECT f.id, f.type, f.sub_type
			 FROM forms f
			 JOIN forms s
			   ON s.tenant_code = $sourceTenant
			  AND s.organization_id = $sourceOrgId
			  AND f.type = s.type
			  AND f.sub_type = s.sub_type
			 WHERE f.tenant_code = $targetTenant
			   AND f.organization_id = $targetOrgId
			 LIMIT 20;`,
			{ sourceTenant, targetTenant, sourceOrgId: sourceOrg.id, targetOrgId: targetOrg.id },
			tx
		)
		assertOrThrow(formUniqueCollision.length === 0, 'forms unique key collision in target tenant/org', {
			sample: formUniqueCollision,
		})
	}

	if (sourceEntityTypeIdArray.length > 0) {
		const entityTypePkCollision = await querySelect(
			sequelize,
			`SELECT id
			 FROM entity_types
			 WHERE tenant_code = $targetTenant
			   AND id = ANY($sourceEntityTypeIds)
			 LIMIT 20;`,
			{ targetTenant, sourceEntityTypeIds: sourceEntityTypeIdArray },
			tx
		)
		assertOrThrow(entityTypePkCollision.length === 0, 'entity_types id collision in target tenant', {
			sample: entityTypePkCollision,
		})

		const entityTypeValueCollision = await querySelect(
			sequelize,
			`SELECT t.id, t.value
			 FROM entity_types t
			 JOIN entity_types s
			   ON s.tenant_code = $sourceTenant
			  AND s.organization_code = $orgCode
			  AND s.organization_id = $sourceOrgId
			  AND s.deleted_at IS NULL
			  AND t.value = s.value
			 WHERE t.tenant_code = $targetTenant
			   AND t.organization_code = $orgCode
			   AND t.organization_id = $targetOrgId
			   AND t.deleted_at IS NULL
			 LIMIT 20;`,
			{
				sourceTenant,
				targetTenant,
				orgCode,
				sourceOrgId: sourceOrg.id,
				targetOrgId: targetOrg.id,
			},
			tx
		)
		assertOrThrow(
			entityTypeValueCollision.length === 0,
			'entity_types active value collision in target tenant/org',
			{
				sample: entityTypeValueCollision,
			}
		)
	}

	if (sourceEntityIds.length > 0) {
		const entityPkCollision = await querySelect(
			sequelize,
			`SELECT id
			 FROM entities
			 WHERE tenant_code = $targetTenant
			   AND id = ANY($sourceEntityIds)
			 LIMIT 20;`,
			{ targetTenant, sourceEntityIds },
			tx
		)
		assertOrThrow(entityPkCollision.length === 0, 'entities id collision in target tenant', {
			sample: entityPkCollision,
		})

		const entityUniqueCollision = await querySelect(
			sequelize,
			`SELECT t.id, t.value, t.entity_type_id
			 FROM entities t
			 JOIN entities s
			   ON s.tenant_code = $sourceTenant
			  AND s.organization_code = $orgCode
			  AND s.deleted_at IS NULL
			  AND t.value = s.value
			  AND t.entity_type_id = s.entity_type_id
			 WHERE t.tenant_code = $targetTenant
			   AND t.organization_code = $orgCode
			   AND t.deleted_at IS NULL
			 LIMIT 20;`,
			{ sourceTenant, targetTenant, orgCode },
			tx
		)
		assertOrThrow(entityUniqueCollision.length === 0, 'entities active unique-key collision in target tenant/org', {
			sample: entityUniqueCollision,
		})
	}

	if (sourceTemplateIds.length > 0) {
		const notificationPkCollision = await querySelect(
			sequelize,
			`SELECT id
			 FROM notification_templates
			 WHERE tenant_code = $targetTenant
			   AND id = ANY($sourceTemplateIds)
			 LIMIT 20;`,
			{ targetTenant, sourceTemplateIds },
			tx
		)
		assertOrThrow(notificationPkCollision.length === 0, 'notification_templates id collision in target tenant', {
			sample: notificationPkCollision,
		})

		const notificationUniqueCollision = await querySelect(
			sequelize,
			`SELECT t.id, t.type, t.code
			 FROM notification_templates t
			 JOIN notification_templates s
			   ON s.tenant_code = $sourceTenant
			  AND s.organization_code = $orgCode
			  AND t.type = s.type
			  AND t.code = s.code
			 WHERE t.tenant_code = $targetTenant
			   AND t.organization_code = $orgCode
			 LIMIT 20;`,
			{ sourceTenant, targetTenant, orgCode },
			tx
		)
		assertOrThrow(
			notificationUniqueCollision.length === 0,
			'notification_templates unique key collision in target tenant/org',
			{ sample: notificationUniqueCollision }
		)
	}

	const sourceRolesFromUor = await querySelect(
		sequelize,
		`SELECT DISTINCT role_id
		 FROM user_organization_roles
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode
		   AND user_id = ANY($userIds);`,
		{ sourceTenant, orgCode, userIds },
		tx
	)

	const sourceRolesFromUsers = await querySelect(
		sequelize,
		`SELECT DISTINCT unnest(roles) AS role_id
		 FROM users
		 WHERE tenant_code = $sourceTenant
		   AND id = ANY($userIds);`,
		{ sourceTenant, userIds },
		tx
	)

	const requiredRoleIds = new Set()
	sourceRolesFromUor.forEach((row) => row.role_id !== null && requiredRoleIds.add(Number(row.role_id)))
	sourceRolesFromUsers.forEach((row) => row.role_id !== null && requiredRoleIds.add(Number(row.role_id)))
	const requiredRoleIdArray = Array.from(requiredRoleIds)

	const sourceRoleRows =
		requiredRoleIdArray.length > 0
			? await querySelect(
					sequelize,
					`SELECT ur.id, ur.title, ur.deleted_at, ur.organization_id, o.code AS organization_code
					 FROM user_roles ur
					 JOIN organizations o
					   ON o.id = ur.organization_id
					  AND o.tenant_code = ur.tenant_code
					 WHERE ur.tenant_code = $sourceTenant
					   AND ur.id = ANY($requiredRoleIdArray);`,
					{ sourceTenant, requiredRoleIdArray },
					tx
			  )
			: []

	assertOrThrow(sourceRoleRows.length === requiredRoleIdArray.length, 'Referenced source role not found', {
		requiredRoleCount: requiredRoleIdArray.length,
		foundRoleCount: sourceRoleRows.length,
	})

	const sourceRoleById = new Map(sourceRoleRows.map((row) => [Number(row.id), row]))

	const sourceUsers = await querySelect(
		sequelize,
		`SELECT id, name, email, email_verified, roles, status, password, has_accepted_terms_and_conditions, about, location, languages, preferred_language, share_link, image, custom_entity_text, meta, created_at, updated_at, deleted_at, phone, phone_code, username, configs
		 FROM users
		 WHERE tenant_code = $sourceTenant
		   AND id = ANY($userIds);`,
		{ sourceTenant, userIds },
		tx
	)
	assertOrThrow(sourceUsers.length === userIds.length, 'Some scoped users are missing in users table', {
		scopedUserCount: userIds.length,
		foundUserCount: sourceUsers.length,
	})

	const externalSpecData = await loadExternalEntityTypeSpecs(sequelize, tx, {
		sourceTenant,
		orgCode,
		sourceOrg,
		sourceDefaultOrg,
		defaultOrgCode,
	})

	const sourceUserOrganizations = await querySelect(
		sequelize,
		`SELECT user_id, organization_code, created_at, updated_at, deleted_at
		 FROM user_organizations
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode
		   AND user_id = ANY($userIds);`,
		{ sourceTenant, orgCode, userIds },
		tx
	)

	const sourceUserOrganizationRoles = await querySelect(
		sequelize,
		`SELECT user_id, organization_code, role_id, created_at, updated_at, deleted_at
		 FROM user_organization_roles
		 WHERE tenant_code = $sourceTenant
		   AND organization_code = $orgCode
		   AND user_id = ANY($userIds);`,
		{ sourceTenant, orgCode, userIds },
		tx
	)

	const sourceUserSessions = await querySelect(
		sequelize,
		`SELECT id, user_id, started_at, ended_at, token, device_info, refresh_token, created_at, updated_at, deleted_at
		 FROM user_sessions
		 WHERE tenant_code = $sourceTenant
		   AND user_id = ANY($userIds);`,
		{ sourceTenant, userIds },
		tx
	)

	const sourceCounts = {
		users: sourceUsers.length,
		user_organizations: sourceUserOrganizations.length,
		user_organization_roles: sourceUserOrganizationRoles.length,
		user_sessions: sourceUserSessions.length,
		forms: sourceForms.length,
		entity_types: sourceEntityTypes.length,
		entities: sourceEntities.length,
		notification_templates: sourceNotificationTemplates.length,
	}

	return {
		sourceTenant,
		targetTenant,
		orgCode,
		defaultOrgCode,
		sourceOrg,
		sourceDefaultOrg,
		targetOrg,
		userIds,
		sourceUsers,
		sourceUserOrganizations,
		sourceUserOrganizationRoles,
		sourceUserSessions,
		sourceForms,
		sourceEntityTypes,
		sourceEntities,
		sourceNotificationTemplates,
		sourceCounts,
		requiredRoleIdArray,
		sourceRoleById,
		externalEntityTypeSpecs: externalSpecData.externalEntityTypeSpecs,
		externalMetaKeys: externalSpecData.externalMetaKeys,
		externalEntityTypeStats: externalSpecData.externalEntityTypeStats,
	}
}

async function ensureStrictIdCompatibility(sequelize, tx, context, options) {
	const { targetTenant, sourceRoleById, requiredRoleIdArray } = context

	const compatibilityResult = {
		performedRebase: false,
		roleMap: new Map(requiredRoleIdArray.map((roleId) => [roleId, roleId])),
	}

	if (requiredRoleIdArray.length === 0) {
		return compatibilityResult
	}

	const targetRolesByIdRows = await querySelect(
		sequelize,
		`SELECT ur.id, ur.title, ur.deleted_at, o.code AS organization_code
		 FROM user_roles ur
		 JOIN organizations o
		   ON o.id = ur.organization_id
		  AND o.tenant_code = ur.tenant_code
		 WHERE ur.tenant_code = $targetTenant
		   AND ur.deleted_at IS NULL
		   AND ur.id = ANY($requiredRoleIdArray);`,
		{ targetTenant, requiredRoleIdArray },
		tx
	)

	const targetRoleById = new Map(targetRolesByIdRows.map((row) => [Number(row.id), row]))

	let compatible = true
	for (const roleId of requiredRoleIdArray) {
		const sourceRole = sourceRoleById.get(roleId)
		const targetRole = targetRoleById.get(roleId)
		if (!targetRole) {
			compatible = false
			break
		}
		if (
			String(sourceRole.title).toLowerCase() !== String(targetRole.title).toLowerCase() ||
			String(sourceRole.organization_code).toLowerCase() !== String(targetRole.organization_code).toLowerCase()
		) {
			compatible = false
			break
		}
	}

	if (compatible) {
		return compatibilityResult
	}

	assertOrThrow(
		options.strictIdRebase === 'if-target-tenant-empty',
		'Strict-id is incompatible and strict-id-rebase is set to never'
	)

	const targetCounts = await querySelect(
		sequelize,
		`SELECT
			(SELECT COUNT(*)::int FROM users WHERE tenant_code = $targetTenant) AS users_count,
			(SELECT COUNT(*)::int FROM user_organizations WHERE tenant_code = $targetTenant) AS user_org_count,
			(SELECT COUNT(*)::int FROM user_organization_roles WHERE tenant_code = $targetTenant) AS user_org_role_count,
			(SELECT COUNT(*)::int FROM organization_role_requests WHERE tenant_code = $targetTenant) AS org_role_req_count;`,
		{ targetTenant },
		tx
	)

	const countRow = targetCounts[0]
	assertOrThrow(
		Number(countRow.users_count) === 0 &&
			Number(countRow.user_org_count) === 0 &&
			Number(countRow.user_org_role_count) === 0 &&
			Number(countRow.org_role_req_count) === 0,
		'Strict-id rebase allowed only when target tenant has no users/relations',
		{ targetCounts: countRow }
	)

	const targetActiveRoles = await querySelect(
		sequelize,
		`SELECT ur.id, ur.title, o.code AS organization_code
		 FROM user_roles ur
		 JOIN organizations o
		   ON o.id = ur.organization_id
		  AND o.tenant_code = ur.tenant_code
		 WHERE ur.tenant_code = $targetTenant
		   AND ur.deleted_at IS NULL;`,
		{ targetTenant },
		tx
	)

	const targetRoleKeyMap = new Map()
	for (const targetRole of targetActiveRoles) {
		const key = keyForRole(targetRole.title, targetRole.organization_code)
		if (!targetRoleKeyMap.has(key)) {
			targetRoleKeyMap.set(key, [])
		}
		targetRoleKeyMap.get(key).push(targetRole)
	}

	const rolesNeedingRebase = requiredRoleIdArray.filter((roleId) => {
		const sourceRole = sourceRoleById.get(roleId)
		const targetRole = targetRoleById.get(roleId)
		return !(
			targetRole &&
			String(sourceRole.title).toLowerCase() === String(targetRole.title).toLowerCase() &&
			String(sourceRole.organization_code).toLowerCase() === String(targetRole.organization_code).toLowerCase()
		)
	})

	const targetToSourceIdMap = []
	for (const sourceRoleId of rolesNeedingRebase) {
		const sourceRole = sourceRoleById.get(sourceRoleId)
		const key = keyForRole(sourceRole.title, sourceRole.organization_code)
		const matchedTargetRoles = targetRoleKeyMap.get(key) || []
		assertOrThrow(
			matchedTargetRoles.length === 1,
			'Unable to uniquely map required source role to target role for strict-id rebase',
			{
				sourceRoleId,
				title: sourceRole.title,
				organizationCode: sourceRole.organization_code,
				matchCount: matchedTargetRoles.length,
			}
		)
		targetToSourceIdMap.push({
			oldId: Number(matchedTargetRoles[0].id),
			newId: Number(sourceRole.id),
			title: sourceRole.title,
			organizationCode: sourceRole.organization_code,
		})
	}

	const dedupByNewId = new Set(targetToSourceIdMap.map((row) => row.newId))
	assertOrThrow(
		dedupByNewId.size === targetToSourceIdMap.length,
		'Strict-id rebase generated duplicate desired role ids for required roles'
	)

	const desiredIds = targetToSourceIdMap.filter((row) => row.oldId !== row.newId).map((row) => row.newId)
	if (desiredIds.length > 0) {
		const collisionWithDeleted = await querySelect(
			sequelize,
			`SELECT id, title, deleted_at
			 FROM user_roles
			 WHERE tenant_code = $targetTenant
			   AND deleted_at IS NOT NULL
			   AND id = ANY($desiredIds)
			 LIMIT 20;`,
			{ targetTenant, desiredIds },
			tx
		)
		assertOrThrow(
			collisionWithDeleted.length === 0,
			'Strict-id rebase would collide with existing deleted roles in target tenant',
			{ sample: collisionWithDeleted }
		)
	}

	const mappedOldIds = new Set(targetToSourceIdMap.filter((row) => row.oldId !== row.newId).map((row) => row.oldId))
	const blockingRows = desiredIds.length
		? await querySelect(
				sequelize,
				`SELECT id
				 FROM user_roles
				 WHERE tenant_code = $targetTenant
				   AND deleted_at IS NULL
				   AND id = ANY($desiredIds)
				   AND NOT (id = ANY($mappedOldIds));`,
				{
					targetTenant,
					desiredIds,
					mappedOldIds: Array.from(mappedOldIds),
				},
				tx
		  )
		: []

	let nextFreeRoleId = 0
	if (blockingRows.length > 0) {
		// NOTE: Assigning IDs above MAX(id) here. If this path is exercised,
		// the backing sequence for user_roles.id must be reset after the rebase
		// (setval to COALESCE(MAX(id),1)) to prevent future insert collisions.
		const maxIdRows = await querySelect(
			sequelize,
			`SELECT COALESCE(MAX(id), 0) AS max_id
			 FROM user_roles
			 WHERE tenant_code = $targetTenant;`,
			{ targetTenant },
			tx
		)
		nextFreeRoleId = Number(maxIdRows[0].max_id) + 1
	}

	for (const blocker of blockingRows) {
		await queryRaw(
			sequelize,
			`UPDATE user_roles
			 SET id = $newId
			 WHERE tenant_code = $targetTenant
			   AND deleted_at IS NULL
			   AND id = $oldId;`,
			{
				targetTenant,
				oldId: Number(blocker.id),
				newId: nextFreeRoleId,
			},
			tx
		)
		nextFreeRoleId += 1
	}

	let tempSeed = -1000000000
	for (const mapping of targetToSourceIdMap) {
		if (mapping.oldId === mapping.newId) {
			continue
		}
		await queryRaw(
			sequelize,
			`UPDATE user_roles
			 SET id = $tmpId
			 WHERE tenant_code = $targetTenant
			   AND deleted_at IS NULL
			   AND id = $oldId;`,
			{ tmpId: tempSeed, targetTenant, oldId: mapping.oldId },
			tx
		)
		mapping.tmpId = tempSeed
		tempSeed -= 1
	}

	for (const mapping of targetToSourceIdMap) {
		if (mapping.oldId === mapping.newId) {
			continue
		}
		await queryRaw(
			sequelize,
			`UPDATE user_roles
			 SET id = $newId
			 WHERE tenant_code = $targetTenant
			   AND deleted_at IS NULL
			   AND id = $tmpId;`,
			{ newId: mapping.newId, targetTenant, tmpId: mapping.tmpId },
			tx
		)
	}

	const verifyRows = await querySelect(
		sequelize,
		`SELECT ur.id, ur.title, o.code AS organization_code
		 FROM user_roles ur
		 JOIN organizations o
		   ON o.id = ur.organization_id
		  AND o.tenant_code = ur.tenant_code
		 WHERE ur.tenant_code = $targetTenant
		   AND ur.deleted_at IS NULL
		   AND ur.id = ANY($requiredRoleIdArray);`,
		{ targetTenant, requiredRoleIdArray },
		tx
	)

	const verifyMap = new Map(verifyRows.map((row) => [Number(row.id), row]))
	for (const roleId of requiredRoleIdArray) {
		const sourceRole = sourceRoleById.get(roleId)
		const targetRole = verifyMap.get(roleId)
		assertOrThrow(!!targetRole, 'Strict-id rebase did not materialize required role id in target tenant', {
			roleId,
		})
		assertOrThrow(
			String(sourceRole.title).toLowerCase() === String(targetRole.title).toLowerCase() &&
				String(sourceRole.organization_code).toLowerCase() ===
					String(targetRole.organization_code).toLowerCase(),
			'Strict-id rebase semantic mismatch for role id',
			{ roleId, sourceRole, targetRole }
		)
	}

	compatibilityResult.roleMap = new Map(requiredRoleIdArray.map((roleId) => [Number(roleId), Number(roleId)]))
	compatibilityResult.performedRebase = true
	return compatibilityResult
}

async function buildMapByTitleRoleMap(sequelize, tx, context) {
	const { targetTenant, requiredRoleIdArray, sourceRoleById } = context
	const roleMap = new Map()

	for (const sourceRoleId of requiredRoleIdArray) {
		const sourceRole = sourceRoleById.get(sourceRoleId)
		const matched = await querySelect(
			sequelize,
			`SELECT ur.id
			 FROM user_roles ur
			 JOIN organizations o
			   ON o.id = ur.organization_id
			  AND o.tenant_code = ur.tenant_code
			 WHERE ur.tenant_code = $targetTenant
			   AND o.code = $organizationCode
			   AND LOWER(ur.title) = LOWER($title)
			   AND ur.deleted_at IS NULL;`,
			{
				targetTenant,
				organizationCode: sourceRole.organization_code,
				title: sourceRole.title,
			},
			tx
		)

		assertOrThrow(matched.length === 1, 'Role map-by-title is missing or ambiguous', {
			sourceRoleId,
			title: sourceRole.title,
			organizationCode: sourceRole.organization_code,
			matchCount: matched.length,
		})

		roleMap.set(sourceRoleId, Number(matched[0].id))
	}

	return roleMap
}

async function copyOrgScopedTables(sequelize, tx, context) {
	const { sourceTenant, targetTenant, orgCode, sourceOrg, targetOrg } = context
	const results = {
		formsCopied: 0,
		entityTypesCopied: 0,
		entityTypesParentPatched: 0,
		entitiesCopied: 0,
		notificationTemplatesCopied: 0,
	}

	const insertedForms = await querySelect(
		sequelize,
		`INSERT INTO forms (
			id, type, sub_type, data, version, created_at, updated_at, deleted_at, organization_id, tenant_code
		)
		SELECT
			id, type, sub_type, data, version, created_at, updated_at, deleted_at, $targetOrgId, $targetTenant
		FROM forms
		WHERE tenant_code = $sourceTenant
		  AND organization_id = $sourceOrgId
		RETURNING id;`,
		{
			sourceTenant,
			targetTenant,
			sourceOrgId: sourceOrg.id,
			targetOrgId: targetOrg.id,
		},
		tx
	)
	results.formsCopied = insertedForms.length

	const insertedEntityTypes = await querySelect(
		sequelize,
		`INSERT INTO entity_types (
			id, value, label, status, created_by, updated_by, allow_filtering, data_type, organization_id, parent_id,
			has_entities, allow_custom_entities, model_names, created_at, updated_at, deleted_at, meta,
			external_entity_type, required, regex, tenant_code, organization_code
		)
		SELECT
			id, value, label, status, created_by, updated_by, allow_filtering, data_type, $targetOrgId, NULL,
			has_entities, allow_custom_entities, model_names, created_at, updated_at, deleted_at, meta,
			external_entity_type, required, regex, $targetTenant, organization_code
		FROM entity_types
		WHERE tenant_code = $sourceTenant
		  AND organization_code = $orgCode
		  AND organization_id = $sourceOrgId
		RETURNING id;`,
		{
			sourceTenant,
			targetTenant,
			orgCode,
			sourceOrgId: sourceOrg.id,
			targetOrgId: targetOrg.id,
		},
		tx
	)
	results.entityTypesCopied = insertedEntityTypes.length

	const patchedEntityTypeParents = await querySelect(
		sequelize,
		`UPDATE entity_types tgt
		SET parent_id = src.parent_id
		FROM entity_types src
		WHERE tgt.tenant_code = $targetTenant
		  AND tgt.organization_code = $orgCode
		  AND tgt.organization_id = $targetOrgId
		  AND src.tenant_code = $sourceTenant
		  AND src.organization_code = $orgCode
		  AND src.organization_id = $sourceOrgId
		  AND tgt.id = src.id
		  AND src.parent_id IS NOT NULL
		RETURNING tgt.id;`,
		{
			sourceTenant,
			targetTenant,
			orgCode,
			sourceOrgId: sourceOrg.id,
			targetOrgId: targetOrg.id,
		},
		tx
	)
	results.entityTypesParentPatched = patchedEntityTypeParents.length

	const insertedEntities = await querySelect(
		sequelize,
		`INSERT INTO entities (
			id, entity_type_id, value, label, status, type, created_by, updated_by, created_at, updated_at, deleted_at, tenant_code, organization_code
		)
		SELECT
			id, entity_type_id, value, label, status, type, created_by, updated_by, created_at, updated_at, deleted_at, $targetTenant, organization_code
		FROM entities
		WHERE tenant_code = $sourceTenant
		  AND organization_code = $orgCode
		RETURNING id;`,
		{ sourceTenant, targetTenant, orgCode },
		tx
	)
	results.entitiesCopied = insertedEntities.length

	const insertedNotificationTemplates = await querySelect(
		sequelize,
		`INSERT INTO notification_templates (
			id, type, code, subject, body, status, email_header, email_footer, created_by, updated_by, created_at, updated_at, deleted_at, tenant_code, organization_code
		)
		SELECT
			id, type, code, subject, body, status, email_header, email_footer, created_by, updated_by, created_at, updated_at, deleted_at, $targetTenant, organization_code
		FROM notification_templates
		WHERE tenant_code = $sourceTenant
		  AND organization_code = $orgCode
		RETURNING id;`,
		{ sourceTenant, targetTenant, orgCode },
		tx
	)
	results.notificationTemplatesCopied = insertedNotificationTemplates.length

	return results
}

async function moveUserScopedTables(sequelize, tx, context, roleMap, options) {
	const {
		sourceTenant,
		targetTenant,
		sourceUsers,
		usersForInsert,
		sourceUserOrganizations,
		sourceUserOrganizationRoles,
	} = context
	const results = {
		usersInserted: 0,
		userOrganizationsInserted: 0,
		userOrganizationRolesInserted: 0,
		userSessionsInserted: 0,
		sourceSessionsDeleted: 0,
	}

	const userRowsToInsert = Array.isArray(usersForInsert) ? usersForInsert : sourceUsers
	for (const user of userRowsToInsert) {
		const mappedRoles = mapRoleArray(user.roles, roleMap)
		const insertUserRows = await querySelect(
			sequelize,
			`INSERT INTO users (
				id, name, email, email_verified, roles, status, password, has_accepted_terms_and_conditions, about, location, languages, preferred_language, share_link, image, custom_entity_text, meta, created_at, updated_at, deleted_at, tenant_code, phone, phone_code, username, configs
			) VALUES (
				$id, $name, $email, $emailVerified, $roles, $status, $password, $hasAcceptedTnC, $about, $location, $languages, $preferredLanguage, $shareLink, $image, $customEntityText, $meta, $createdAt, $updatedAt, $deletedAt, $targetTenant, $phone, $phoneCode, $username, $configs
			) RETURNING id;`,
			{
				id: user.id,
				name: user.name,
				email: user.email,
				emailVerified: user.email_verified,
				roles: mappedRoles,
				status: user.status,
				password: user.password,
				hasAcceptedTnC: user.has_accepted_terms_and_conditions,
				about: user.about,
				location: user.location,
				languages: user.languages,
				preferredLanguage: user.preferred_language,
				shareLink: user.share_link,
				image: user.image,
				customEntityText: user.custom_entity_text,
				meta: user.meta,
				createdAt: user.created_at,
				updatedAt: user.updated_at,
				deletedAt: user.deleted_at,
				targetTenant,
				phone: user.phone,
				phoneCode: user.phone_code,
				username: user.username,
				configs: user.configs,
			},
			tx
		)
		results.usersInserted += insertUserRows.length
	}

	for (const row of sourceUserOrganizations) {
		const inserted = await querySelect(
			sequelize,
			`INSERT INTO user_organizations (
				user_id, organization_code, tenant_code, created_at, updated_at, deleted_at
			) VALUES (
				$userId, $orgCode, $targetTenant, $createdAt, $updatedAt, $deletedAt
			) RETURNING user_id;`,
			{
				userId: row.user_id,
				orgCode: row.organization_code,
				targetTenant,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
				deletedAt: row.deleted_at,
			},
			tx
		)
		results.userOrganizationsInserted += inserted.length
	}

	for (const row of sourceUserOrganizationRoles) {
		const mappedRoleId = roleMap.get(Number(row.role_id))
		assertOrThrow(!!mappedRoleId, 'Role mapping missing for user_organization_roles row', {
			roleId: row.role_id,
		})

		const inserted = await querySelect(
			sequelize,
			`INSERT INTO user_organization_roles (
				tenant_code, user_id, organization_code, role_id, created_at, updated_at, deleted_at
			) VALUES (
				$targetTenant, $userId, $orgCode, $roleId, $createdAt, $updatedAt, $deletedAt
			) RETURNING user_id;`,
			{
				targetTenant,
				userId: row.user_id,
				orgCode: row.organization_code,
				roleId: mappedRoleId,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
				deletedAt: row.deleted_at,
			},
			tx
		)
		results.userOrganizationRolesInserted += inserted.length
	}

	if (options.sessionMode === 'migrate') {
		const insertedSessions = await querySelect(
			sequelize,
			`INSERT INTO user_sessions (
				id, user_id, started_at, ended_at, token, device_info, refresh_token, created_at, updated_at, deleted_at, tenant_code
			)
			SELECT
				id, user_id, started_at, ended_at, token, device_info, refresh_token, created_at, updated_at, deleted_at, $targetTenant
			FROM user_sessions
			WHERE tenant_code = $sourceTenant
			  AND user_id = ANY($userIds)
			RETURNING id;`,
			{
				sourceTenant,
				targetTenant,
				userIds: context.userIds,
			},
			tx
		)
		results.userSessionsInserted = insertedSessions.length
	}

	const deletedSessions = await querySelect(
		sequelize,
		`DELETE FROM user_sessions
		 WHERE tenant_code = $sourceTenant
		   AND user_id = ANY($userIds)
		 RETURNING id;`,
		{
			sourceTenant,
			userIds: context.userIds,
		},
		tx
	)
	results.sourceSessionsDeleted = deletedSessions.length

	return results
}

async function cleanupSourceRows(sequelize, tx, context, options) {
	const { sourceTenant, orgCode, sourceOrg, userIds } = context
	const now = new Date()
	const results = {
		userRowsAffected: 0,
		orgRowsAffected: 0,
	}

	if (options.deleteMode === 'none') {
		return results
	}

	if (options.deleteMode === 'soft') {
		const softUor = await querySelect(
			sequelize,
			`UPDATE user_organization_roles
			 SET deleted_at = COALESCE(deleted_at, $now)
			 WHERE tenant_code = $sourceTenant
			   AND organization_code = $orgCode
			   AND user_id = ANY($userIds)
			 RETURNING user_id;`,
			{ now, sourceTenant, orgCode, userIds },
			tx
		)
		results.userRowsAffected += softUor.length

		const softUo = await querySelect(
			sequelize,
			`UPDATE user_organizations
			 SET deleted_at = COALESCE(deleted_at, $now)
			 WHERE tenant_code = $sourceTenant
			   AND organization_code = $orgCode
			   AND user_id = ANY($userIds)
			 RETURNING user_id;`,
			{ now, sourceTenant, orgCode, userIds },
			tx
		)
		results.userRowsAffected += softUo.length

		const softUsers = await querySelect(
			sequelize,
			`UPDATE users
			 SET deleted_at = COALESCE(deleted_at, $now)
			 WHERE tenant_code = $sourceTenant
			   AND id = ANY($userIds)
			 RETURNING id;`,
			{ now, sourceTenant, userIds },
			tx
		)
		results.userRowsAffected += softUsers.length

		if (options.deleteScope === 'all-copied') {
			const softForms = await querySelect(
				sequelize,
				`UPDATE forms
				 SET deleted_at = COALESCE(deleted_at, $now)
				 WHERE tenant_code = $sourceTenant
				   AND organization_id = $sourceOrgId
				 RETURNING id;`,
				{ now, sourceTenant, sourceOrgId: sourceOrg.id },
				tx
			)
			results.orgRowsAffected += softForms.length

			const softEntityTypes = await querySelect(
				sequelize,
				`UPDATE entity_types
				 SET deleted_at = COALESCE(deleted_at, $now)
				 WHERE tenant_code = $sourceTenant
				   AND organization_code = $orgCode
				   AND organization_id = $sourceOrgId
				 RETURNING id;`,
				{ now, sourceTenant, orgCode, sourceOrgId: sourceOrg.id },
				tx
			)
			results.orgRowsAffected += softEntityTypes.length

			const softEntities = await querySelect(
				sequelize,
				`UPDATE entities
				 SET deleted_at = COALESCE(deleted_at, $now)
				 WHERE tenant_code = $sourceTenant
				   AND organization_code = $orgCode
				 RETURNING id;`,
				{ now, sourceTenant, orgCode },
				tx
			)
			results.orgRowsAffected += softEntities.length

			const softTemplates = await querySelect(
				sequelize,
				`UPDATE notification_templates
				 SET deleted_at = COALESCE(deleted_at, $now)
				 WHERE tenant_code = $sourceTenant
				   AND organization_code = $orgCode
				 RETURNING id;`,
				{ now, sourceTenant, orgCode },
				tx
			)
			results.orgRowsAffected += softTemplates.length
		}
	}

	if (options.deleteMode === 'hard') {
		const delUor = await querySelect(
			sequelize,
			`DELETE FROM user_organization_roles
			 WHERE tenant_code = $sourceTenant
			   AND organization_code = $orgCode
			   AND user_id = ANY($userIds)
			 RETURNING user_id;`,
			{ sourceTenant, orgCode, userIds },
			tx
		)
		results.userRowsAffected += delUor.length

		const delUo = await querySelect(
			sequelize,
			`DELETE FROM user_organizations
			 WHERE tenant_code = $sourceTenant
			   AND organization_code = $orgCode
			   AND user_id = ANY($userIds)
			 RETURNING user_id;`,
			{ sourceTenant, orgCode, userIds },
			tx
		)
		results.userRowsAffected += delUo.length

		const delUsers = await querySelect(
			sequelize,
			`DELETE FROM users
			 WHERE tenant_code = $sourceTenant
			   AND id = ANY($userIds)
			 RETURNING id;`,
			{ sourceTenant, userIds },
			tx
		)
		results.userRowsAffected += delUsers.length

		if (options.deleteScope === 'all-copied') {
			const delEntities = await querySelect(
				sequelize,
				`DELETE FROM entities
				 WHERE tenant_code = $sourceTenant
				   AND organization_code = $orgCode
				 RETURNING id;`,
				{ sourceTenant, orgCode },
				tx
			)
			results.orgRowsAffected += delEntities.length

			const delEntityTypes = await querySelect(
				sequelize,
				`DELETE FROM entity_types
				 WHERE tenant_code = $sourceTenant
				   AND organization_code = $orgCode
				   AND organization_id = $sourceOrgId
				 RETURNING id;`,
				{ sourceTenant, orgCode, sourceOrgId: sourceOrg.id },
				tx
			)
			results.orgRowsAffected += delEntityTypes.length

			const delForms = await querySelect(
				sequelize,
				`DELETE FROM forms
				 WHERE tenant_code = $sourceTenant
				   AND organization_id = $sourceOrgId
				 RETURNING id;`,
				{ sourceTenant, sourceOrgId: sourceOrg.id },
				tx
			)
			results.orgRowsAffected += delForms.length

			const delTemplates = await querySelect(
				sequelize,
				`DELETE FROM notification_templates
				 WHERE tenant_code = $sourceTenant
				   AND organization_code = $orgCode
				 RETURNING id;`,
				{ sourceTenant, orgCode },
				tx
			)
			results.orgRowsAffected += delTemplates.length
		}
	}

	return results
}

async function postValidate(sequelize, tx, context, operationCounts, options, roleMap) {
	const { targetTenant, sourceTenant, orgCode, targetOrg, userIds, sourceCounts, sourceUsers } = context

	const targetUserCount = await querySelect(
		sequelize,
		`SELECT COUNT(*)::int AS count
		 FROM users
		 WHERE tenant_code = $targetTenant
		   AND id = ANY($userIds);`,
		{ targetTenant, userIds },
		tx
	)
	assertOrThrow(
		Number(targetUserCount[0].count) === sourceCounts.users,
		'Post-validation failed for users count in target',
		{
			expected: sourceCounts.users,
			actual: Number(targetUserCount[0].count),
		}
	)

	const targetUoCount = await querySelect(
		sequelize,
		`SELECT COUNT(*)::int AS count
		 FROM user_organizations
		 WHERE tenant_code = $targetTenant
		   AND organization_code = $orgCode
		   AND user_id = ANY($userIds);`,
		{ targetTenant, orgCode, userIds },
		tx
	)
	assertOrThrow(
		Number(targetUoCount[0].count) === sourceCounts.user_organizations,
		'Post-validation failed for user_organizations count in target',
		{
			expected: sourceCounts.user_organizations,
			actual: Number(targetUoCount[0].count),
		}
	)

	const targetUorCount = await querySelect(
		sequelize,
		`SELECT COUNT(*)::int AS count
		 FROM user_organization_roles
		 WHERE tenant_code = $targetTenant
		   AND organization_code = $orgCode
		   AND user_id = ANY($userIds);`,
		{ targetTenant, orgCode, userIds },
		tx
	)
	assertOrThrow(
		Number(targetUorCount[0].count) === sourceCounts.user_organization_roles,
		'Post-validation failed for user_organization_roles count in target',
		{
			expected: sourceCounts.user_organization_roles,
			actual: Number(targetUorCount[0].count),
		}
	)

	if (options.sessionMode === 'migrate') {
		const targetSessionCount = await querySelect(
			sequelize,
			`SELECT COUNT(*)::int AS count
			 FROM user_sessions
			 WHERE tenant_code = $targetTenant
			   AND user_id = ANY($userIds);`,
			{ targetTenant, userIds },
			tx
		)
		assertOrThrow(
			Number(targetSessionCount[0].count) === sourceCounts.user_sessions,
			'Post-validation failed for user_sessions count in target',
			{
				expected: sourceCounts.user_sessions,
				actual: Number(targetSessionCount[0].count),
			}
		)
	}

	const sourceSessionCount = await querySelect(
		sequelize,
		`SELECT COUNT(*)::int AS count
		 FROM user_sessions
		 WHERE tenant_code = $sourceTenant
		   AND user_id = ANY($userIds);`,
		{ sourceTenant, userIds },
		tx
	)
	assertOrThrow(Number(sourceSessionCount[0].count) === 0, 'Source sessions still exist after session handling', {
		count: Number(sourceSessionCount[0].count),
	})

	const sourceFormIds = context.sourceForms.map((row) => Number(row.id))
	const targetFormsCount =
		sourceFormIds.length > 0
			? await querySelect(
					sequelize,
					`SELECT COUNT(*)::int AS count
					 FROM forms
					 WHERE tenant_code = $targetTenant
					   AND organization_id = $targetOrgId
					   AND id = ANY($sourceFormIds);`,
					{
						targetTenant,
						targetOrgId: targetOrg.id,
						sourceFormIds,
					},
					tx
			  )
			: [{ count: 0 }]
	assertOrThrow(
		Number(targetFormsCount[0].count) === sourceCounts.forms,
		'Post-validation failed for forms count in target',
		{
			expected: sourceCounts.forms,
			actual: Number(targetFormsCount[0].count),
		}
	)

	const sourceEntityTypeIds = context.sourceEntityTypes.map((row) => Number(row.id))
	const targetEntityTypesCount =
		sourceEntityTypeIds.length > 0
			? await querySelect(
					sequelize,
					`SELECT COUNT(*)::int AS count
					 FROM entity_types
					 WHERE tenant_code = $targetTenant
					   AND organization_code = $orgCode
					   AND organization_id = $targetOrgId
					   AND id = ANY($sourceEntityTypeIds);`,
					{
						targetTenant,
						targetOrgId: targetOrg.id,
						orgCode,
						sourceEntityTypeIds,
					},
					tx
			  )
			: [{ count: 0 }]
	assertOrThrow(
		Number(targetEntityTypesCount[0].count) === sourceCounts.entity_types,
		'Post-validation failed for entity_types count in target',
		{
			expected: sourceCounts.entity_types,
			actual: Number(targetEntityTypesCount[0].count),
		}
	)

	const sourceEntityIds = context.sourceEntities.map((row) => Number(row.id))
	const targetEntitiesCount =
		sourceEntityIds.length > 0
			? await querySelect(
					sequelize,
					`SELECT COUNT(*)::int AS count
					 FROM entities
					 WHERE tenant_code = $targetTenant
					   AND organization_code = $orgCode
					   AND id = ANY($sourceEntityIds);`,
					{
						targetTenant,
						orgCode,
						sourceEntityIds,
					},
					tx
			  )
			: [{ count: 0 }]
	assertOrThrow(
		Number(targetEntitiesCount[0].count) === sourceCounts.entities,
		'Post-validation failed for entities count in target',
		{
			expected: sourceCounts.entities,
			actual: Number(targetEntitiesCount[0].count),
		}
	)

	const sourceTemplateIds = context.sourceNotificationTemplates.map((row) => Number(row.id))
	const targetTemplatesCount =
		sourceTemplateIds.length > 0
			? await querySelect(
					sequelize,
					`SELECT COUNT(*)::int AS count
					 FROM notification_templates
					 WHERE tenant_code = $targetTenant
					   AND organization_code = $orgCode
					   AND id = ANY($sourceTemplateIds);`,
					{
						targetTenant,
						orgCode,
						sourceTemplateIds,
					},
					tx
			  )
			: [{ count: 0 }]
	assertOrThrow(
		Number(targetTemplatesCount[0].count) === sourceCounts.notification_templates,
		'Post-validation failed for notification_templates count in target',
		{
			expected: sourceCounts.notification_templates,
			actual: Number(targetTemplatesCount[0].count),
		}
	)

	const targetUsers = await querySelect(
		sequelize,
		`SELECT id, roles
		 FROM users
		 WHERE tenant_code = $targetTenant
		   AND id = ANY($userIds);`,
		{ targetTenant, userIds },
		tx
	)
	const sourceUsersById = new Map(sourceUsers.map((row) => [Number(row.id), row]))
	for (const targetUser of targetUsers) {
		const sourceUser = sourceUsersById.get(Number(targetUser.id))
		const expected = mapRoleArray(sourceUser.roles, roleMap)
		const actual = (targetUser.roles || []).map((roleId) => Number(roleId))
		const matches =
			expected.length === actual.length &&
			expected.every((roleId, index) => Number(roleId) === Number(actual[index]))
		assertOrThrow(matches, 'users.roles mismatch after migration', {
			userId: targetUser.id,
			expected,
			actual,
		})
	}

	if (options.deleteMode === 'hard') {
		const sourceUsersRemaining = await querySelect(
			sequelize,
			`SELECT COUNT(*)::int AS count
			 FROM users
			 WHERE tenant_code = $sourceTenant
			   AND id = ANY($userIds);`,
			{ sourceTenant, userIds },
			tx
		)
		assertOrThrow(
			Number(sourceUsersRemaining[0].count) === 0,
			'Hard delete selected but source users still exist',
			{}
		)
	}

	if (options.deleteMode === 'soft') {
		const sourceUsersSoft = await querySelect(
			sequelize,
			`SELECT COUNT(*)::int AS count
			 FROM users
			 WHERE tenant_code = $sourceTenant
			   AND id = ANY($userIds)
			   AND deleted_at IS NOT NULL;`,
			{ sourceTenant, userIds },
			tx
		)
		assertOrThrow(
			Number(sourceUsersSoft[0].count) === sourceCounts.users,
			'Soft delete selected but source users are not soft-deleted as expected',
			{}
		)
	}

	log('info', 'post_validation_success', {
		operationCounts,
	})
}

async function run() {
	const args = minimist(process.argv.slice(2), {
		string: [
			'current-tenant-code',
			'current-org-code',
			'new-tenant-code',
			'role-resolution',
			'strict-id-rebase',
			'delete-mode',
			'delete-scope',
			'session-mode',
			'lock-strategy',
			'dry-run',
		],
		boolean: ['help'],
	})

	if (args.help) {
		printUsage()
		return
	}

	const environmentData = require('../envVariables')()
	if (!environmentData.success) {
		console.error('Server could not start. Not all environment variables are provided.')
		process.exit(1)
	}

	const rawOptions = {
		currentTenantCode: getOption(args['current-tenant-code'], process.env.MIGRATION_CURRENT_TENANT_CODE, ''),
		currentOrgCode: getOption(args['current-org-code'], process.env.MIGRATION_CURRENT_ORG_CODE, ''),
		newTenantCode: getOption(args['new-tenant-code'], process.env.MIGRATION_NEW_TENANT_CODE, ''),
		roleResolution: getOption(
			args['role-resolution'],
			process.env.MIGRATION_ROLE_RESOLUTION,
			DEFAULTS.roleResolution
		),
		strictIdRebase: getOption(
			args['strict-id-rebase'],
			process.env.MIGRATION_STRICT_ID_REBASE,
			DEFAULTS.strictIdRebase
		),
		deleteMode: getOption(args['delete-mode'], process.env.MIGRATION_DELETE_MODE, DEFAULTS.deleteMode),
		deleteScope: getOption(args['delete-scope'], process.env.MIGRATION_DELETE_SCOPE, DEFAULTS.deleteScope),
		sessionMode: getOption(args['session-mode'], process.env.MIGRATION_SESSION_MODE, DEFAULTS.sessionMode),
		lockStrategy: getOption(args['lock-strategy'], process.env.MIGRATION_LOCK_STRATEGY, DEFAULTS.lockStrategy),
		dryRun: getOption(args['dry-run'], process.env.MIGRATION_DRY_RUN, DEFAULTS.dryRun),
	}

	const options = normalizeAndValidateOptions(rawOptions)

	const nodeEnv = getNodeEnv()
	const databaseUrl = getDatabaseUrl(nodeEnv)
	assertOrThrow(!!databaseUrl, 'Database URL not found. Set DEV/TEST/PROD_DATABASE_URL or DATABASE_URL.', { nodeEnv })

	log('info', 'migration_start', {
		nodeEnv,
		sourceTenant: options.currentTenantCode,
		sourceOrgCode: options.currentOrgCode,
		targetTenant: options.newTenantCode,
		roleResolution: options.roleResolution,
		strictIdRebase: options.strictIdRebase,
		deleteMode: options.deleteMode,
		deleteScope: options.deleteScope,
		sessionMode: options.sessionMode,
		lockStrategy: options.lockStrategy,
		dryRun: options.dryRun,
	})

	const sequelize = new Sequelize(databaseUrl, {
		dialect: 'postgres',
		logging: false,
	})

	let tx = null
	try {
		await sequelize.authenticate()
		log('info', 'db_connection_success')

		tx = await sequelize.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
		})
		log('info', 'transaction_started', { isolationLevel: 'SERIALIZABLE' })

		await lockByStrategy(sequelize, tx, options)
		log('info', 'lock_strategy_applied', { lockStrategy: options.lockStrategy })

		const context = await buildContextAndPrecheck(sequelize, tx, options)
		log('info', 'precheck_success', {
			sourceOrgId: context.sourceOrg.id,
			targetOrgId: context.targetOrg.id,
			userCount: context.sourceCounts.users,
			sourceCounts: context.sourceCounts,
		})
		log('info', 'default_org_resolved', {
			sourceTenant: context.sourceTenant,
			defaultOrgCode: context.defaultOrgCode,
			defaultOrgId: context.sourceDefaultOrg.id,
		})
		log('info', 'external_entity_type_detection_summary', {
			sourceTenant: context.sourceTenant,
			sourceOrgCode: context.orgCode,
			defaultOrgCode: context.defaultOrgCode,
			sourceScopedCount: context.externalEntityTypeStats.sourceScopedCount,
			defaultScopedCount: context.externalEntityTypeStats.defaultScopedCount,
			dedupedFinalKeyCount: context.externalEntityTypeStats.dedupedCount,
			externalMetaKeys: context.externalMetaKeys,
		})

		let roleMap = new Map(context.requiredRoleIdArray.map((roleId) => [roleId, roleId]))
		let performedStrictIdRebase = false

		if (options.roleResolution === 'strict-id') {
			const strictResult = await ensureStrictIdCompatibility(sequelize, tx, context, options)
			roleMap = strictResult.roleMap
			performedStrictIdRebase = strictResult.performedRebase
		} else {
			roleMap = await buildMapByTitleRoleMap(sequelize, tx, context)
		}

		log('info', 'role_resolution_ready', {
			roleResolution: options.roleResolution,
			requiredRoleCount: context.requiredRoleIdArray.length,
			mapSize: roleMap.size,
			performedStrictIdRebase,
		})

		const externalRemapResult = await remapExternalMetaForUsers(context)
		context.usersForInsert = externalRemapResult.usersForInsert
		log('info', 'external_meta_remap_ready', externalRemapResult.stats)

		if (options.dryRun) {
			await tx.rollback()
			tx = null
			log('info', 'dry_run_complete', {
				sourceCounts: context.sourceCounts,
				roleMapSize: roleMap.size,
				externalMetaRemap: externalRemapResult.stats,
				userTables: USER_TABLES,
				orgTables: ORG_TABLES,
			})
			return
		}

		const orgCopyCounts = await copyOrgScopedTables(sequelize, tx, context)
		log('info', 'org_tables_copied', orgCopyCounts)

		const userMoveCounts = await moveUserScopedTables(sequelize, tx, context, roleMap, options)
		log('info', 'user_tables_moved', userMoveCounts)

		const cleanupCounts = await cleanupSourceRows(sequelize, tx, context, options)
		log('info', 'source_cleanup_complete', cleanupCounts)

		await postValidate(
			sequelize,
			tx,
			context,
			{ ...orgCopyCounts, ...userMoveCounts, ...cleanupCounts },
			options,
			roleMap
		)

		await tx.commit()
		tx = null
		log('info', 'migration_commit_success')
	} catch (error) {
		if (tx) {
			try {
				await tx.rollback()
			} catch (rollbackError) {
				log('error', 'rollback_failed', {
					message: rollbackError.message,
					stack: rollbackError.stack,
				})
			}
		}
		log('error', 'migration_failed', {
			message: error.message,
			sqlState: error?.original?.code || null,
			details: error?.details || null,
			stack: error.stack,
		})
		process.exitCode = 1
	} finally {
		try {
			await sequelize.close()
		} catch (closeError) {
			log('error', 'db_close_failed', {
				message: closeError.message,
			})
		}
	}
}

run()
