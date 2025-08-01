const { Sequelize } = require('sequelize')
let Table = require('cli-table')
require('dotenv').config({ path: '../../.env' })

// Environment setup
const nodeEnv = process.env.NODE_ENV || 'development'

let databaseUrl

switch (nodeEnv) {
	case 'production':
		databaseUrl = process?.env?.PROD_DATABASE_URL || process.env.DEV_DATABASE_URL
		break
	case 'test':
		databaseUrl = process?.env?.TEST_DATABASE_URL || process.env.DEV_DATABASE_URL
		break
	default:
		databaseUrl = process.env.DEV_DATABASE_URL
}

console.info('Database selected: ', databaseUrl.split('/').at(-1))

// Function to prompt user and get input
function promptUser(question) {
	return new Promise((resolve) => {
		process.stdout.write(question)
		process.stdin.once('data', (data) => {
			resolve(data.toString().trim())
		})
	})
}
// Initialize Sequelize
const sequelize = new Sequelize(databaseUrl, {
	dialect: 'postgres',
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

;(async () => {
	try {
		const organizationCode = await promptUser(
			'---------> Please enter the organization code to delete (e.g., sot): '
		)

		// Test database connection
		await sequelize.authenticate()
		console.log('Database connection established successfully.')
		REPORT_QUERY = `WITH user_org_roles AS (
    SELECT 'user_organization_roles' AS table_name, 
           json_agg(row_to_json(uor)) AS data, 
           count(*) AS row_count
    FROM user_organization_roles uor
    WHERE organization_code = '${organizationCode}'
),
user_orgs AS (
    SELECT 'user_organizations' AS table_name, 
           json_agg(row_to_json(uo)) AS data, 
           count(*) AS row_count
    FROM user_organizations uo
    WHERE organization_code = '${organizationCode}'
),
users_to_delete AS (
    SELECT 'users' AS table_name, 
           json_agg(row_to_json(u)) AS data, 
           count(*) AS row_count
    FROM users u
    WHERE u.id IN (
        SELECT user_id 
        FROM user_organizations 
        WHERE organization_code = '${organizationCode}'
    )
),
orgs AS (
    SELECT 'organizations' AS table_name, 
           json_agg(row_to_json(o)) AS data, 
           count(*) AS row_count
    FROM organizations o
    WHERE code = '${organizationCode}'
),
invites AS (
    SELECT 'organization_user_invites' AS table_name, 
           json_agg(row_to_json(oui)) AS data, 
           count(*) AS row_count
    FROM organization_user_invites oui
    WHERE organization_code = '${organizationCode}'
),
notifications AS (
    SELECT 'notification_templates' AS table_name, 
           json_agg(row_to_json(nt)) AS data, 
           count(*) AS row_count
    FROM notification_templates nt
    WHERE organization_code = '${organizationCode}'
),
features AS (
    SELECT 'organization_features' AS table_name, 
           json_agg(row_to_json(of)) AS data, 
           count(*) AS row_count
    FROM organization_features of
    WHERE organization_code = '${organizationCode}'
),
reg_codes AS (
    SELECT 'organization_registration_codes' AS table_name, 
           json_agg(row_to_json(orc)) AS data, 
           count(*) AS row_count
    FROM organization_registration_codes orc
    WHERE organization_code = '${organizationCode}'
)
SELECT table_name, row_count
FROM user_org_roles
UNION ALL
SELECT table_name, row_count
FROM user_orgs
UNION ALL
SELECT table_name, row_count
FROM users_to_delete
UNION ALL
SELECT table_name, row_count
FROM orgs
UNION ALL
SELECT table_name, row_count
FROM invites
UNION ALL
SELECT table_name, row_count
FROM notifications
UNION ALL
SELECT table_name, row_count
FROM features
UNION ALL
SELECT table_name, row_count
FROM reg_codes;`
		const report = await sequelize.query(REPORT_QUERY, {
			type: Sequelize.QueryTypes.RAW,
			raw: true,
		})

		let table = new Table({
			head: ['Table Name', 'Row Count'],
			colWidths: [30, 15],
		})

		// Populate the table with data
		report[0].forEach((item) => {
			table.push([item.table_name, item.row_count])
		})

		// Print the table
		console.log('\n\n\nBelow is number of rows attached to the organization code: ', organizationCode)
		console.log(table.toString())

		const confirmation = await promptUser(
			'---------> Are you sure you want to delete all data related to this organization? (yes/no): '
		)
		// Start transaction
		if (confirmation.toLowerCase() == 'yes') {
			await sequelize.transaction(async (t) => {
				// Delete from user_organization_roles
				const DELETE_USER_ORG_ROLES_QUERY =
					'DELETE FROM user_organization_roles WHERE organization_code = :organizationCode RETURNING *'
				const deletedUserOrgRoles = await sequelize.query(DELETE_USER_ORG_ROLES_QUERY, {
					replacements: { organizationCode },
					type: Sequelize.QueryTypes.DELETE,
					raw: true,
					transaction: t,
				})
				console.info('Deleted user_organization_roles: ', deletedUserOrgRoles)

				// Delete from user_organizations and capture user_ids
				const DELETE_USER_ORGS_QUERY =
					'DELETE FROM user_organizations WHERE organization_code = :organizationCode RETURNING user_id'
				const deletedUserOrgs = await sequelize.query(DELETE_USER_ORGS_QUERY, {
					replacements: { organizationCode },
					type: Sequelize.QueryTypes.DELETE,
					raw: true,
					transaction: t,
				})
				const userIdsToDelete = deletedUserOrgs.map((row) => row.user_id)
				console.info('Deleted user_organizations, user_ids: ', userIdsToDelete)

				// Delete from users
				if (userIdsToDelete.length > 0) {
					const DELETE_USERS_QUERY =
						'DELETE FROM users WHERE id IN (:userIdsToDelete) AND NOT EXISTS (SELECT 1 FROM user_organizations WHERE user_organizations.user_id = users.id )  RETURNING *'
					const deletedUsers = await sequelize.query(DELETE_USERS_QUERY, {
						replacements: { userIdsToDelete },
						type: Sequelize.QueryTypes.DELETE,
						raw: true,
						transaction: t,
					})
					console.info('Deleted users: ', deletedUsers)
				}

				// Delete from organizations
				const DELETE_ORGS_QUERY = 'DELETE FROM organizations WHERE code = :organizationCode RETURNING *'
				const deletedOrgs = await sequelize.query(DELETE_ORGS_QUERY, {
					replacements: { organizationCode },
					type: Sequelize.QueryTypes.DELETE,
					raw: true,
					transaction: t,
				})
				console.info('Deleted organizations: ', deletedOrgs)

				// Delete from organization_user_invites
				const DELETE_INVITES_QUERY =
					'DELETE FROM organization_user_invites WHERE organization_code = :organizationCode RETURNING *'
				const deletedInvites = await sequelize.query(DELETE_INVITES_QUERY, {
					replacements: { organizationCode },
					type: Sequelize.QueryTypes.DELETE,
					raw: true,
					transaction: t,
				})
				console.info('Deleted organization_user_invites: ', deletedInvites)

				// Delete from notification_templates
				const DELETE_NOTIFICATIONS_QUERY =
					'DELETE FROM notification_templates WHERE organization_code = :organizationCode RETURNING *'
				const deletedNotifications = await sequelize.query(DELETE_NOTIFICATIONS_QUERY, {
					replacements: { organizationCode },
					type: Sequelize.QueryTypes.DELETE,
					raw: true,
					transaction: t,
				})
				console.info('Deleted notification_templates: ', deletedNotifications)

				// Delete from organization_features
				const DELETE_FEATURES_QUERY =
					'DELETE FROM organization_features WHERE organization_code = :organizationCode RETURNING *'
				const deletedFeatures = await sequelize.query(DELETE_FEATURES_QUERY, {
					replacements: { organizationCode },
					type: Sequelize.QueryTypes.DELETE,
					raw: true,
					transaction: t,
				})
				console.info('Deleted organization_features: ', deletedFeatures)

				// Delete from organization_registration_codes
				const DELETE_REG_CODES_QUERY =
					'DELETE FROM organization_registration_codes WHERE organization_code = :organizationCode RETURNING *'
				const deletedRegCodes = await sequelize.query(DELETE_REG_CODES_QUERY, {
					replacements: { organizationCode },
					type: Sequelize.QueryTypes.DELETE,
					raw: true,
					transaction: t,
				})
				console.info('Deleted organization_registration_codes: ', deletedRegCodes)
				// await t.commit();
			})

			console.log('Transaction completed successfully.')
		} else {
			console.log('Transaction aborted by user.')
		}
	} catch (error) {
		console.error(`Error executing transaction: ${error}`)
	} finally {
		sequelize.close()
	}
})()
