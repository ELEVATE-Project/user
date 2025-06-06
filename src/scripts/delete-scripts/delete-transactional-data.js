const { Sequelize } = require('sequelize')
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

// Initialize Sequelize
const sequelize = new Sequelize(databaseUrl, {
	dialect: 'postgres',
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

;(async () => {
	try {
		const allowed_tenants = ['shikshagraha', 'shikshalokam', 'default']
		console.info('ALLOWED TENANTS: ', allowed_tenants)

		const ORG_FETCH_QUERY =
			'SELECT id , name , code FROM organizations WHERE tenant_code IN (:allowedTenants) AND code NOT IN (:defaultOrgCode) OR tenant_code NOT IN (:allowedTenants)'

		// Test database connection
		await sequelize.authenticate()
		console.log('Database connection established successfully.')

		// Execute the query with replacements
		const fetchOrgs = await sequelize.query(ORG_FETCH_QUERY, {
			replacements: { allowedTenants: allowed_tenants, defaultOrgCode: process.env.DEFAULT_ORGANISATION_CODE },
			type: Sequelize.QueryTypes.SELECT,
			raw: true,
		})

		const orgsToRemove = fetchOrgs.map((orgs) => orgs.id)
		const orgsCodesToRemove = fetchOrgs.map((orgs) => orgs.code)
		console.info('Organizations to remove : ', fetchOrgs)

		//fetch system admin and org admin roles
		const allowedRoles = ['admin', 'org_admin']
		const ROLES_FETCH_QUERY =
			'SELECT id FROM user_roles WHERE tenant_code IN (:allowedTenants) AND title IN (:allowedRoles)'
		// Execute the query with replacements
		const fetchRoles = await sequelize.query(ROLES_FETCH_QUERY, {
			replacements: { allowedTenants: allowed_tenants, allowedRoles },
			type: Sequelize.QueryTypes.SELECT,
			raw: true,
		})

		const systemRoles = fetchRoles.map((role) => role.id)
		console.log('System Role ids : ', systemRoles)

		const FETCH_USERID_QUERY =
			'SELECT user_id FROM user_organization_roles WHERE organization_code IN (:orgsCodesToRemove) AND role_id NOT IN (:systemRoles)  OR tenant_code NOT IN (:allowedTenants)'
		// Execute the query with replacements
		const fetchUserIds = await sequelize.query(FETCH_USERID_QUERY, {
			replacements: { orgsCodesToRemove, systemRoles, allowedTenants: allowed_tenants },
			type: Sequelize.QueryTypes.SELECT,
			raw: true,
		})
		const userIdsToDelete = fetchUserIds.map((user) => user.user_id)

		console.log('User ids to delete : ', userIdsToDelete)

		// fetch user org roles to delete
		const DELETE_USER_ORG_ROLES_QUERY = 'DELETE FROM user_organization_roles WHERE user_id IN (:userIdsToDelete)'
		const deleteOrgUserRoles = await sequelize.query(DELETE_USER_ORG_ROLES_QUERY, {
			replacements: { userIdsToDelete },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})

		// fetch user org roles to delete
		const DELETE_USER_ORGS_QUERY = 'DELETE FROM user_organizations WHERE user_id IN (:userIdsToDelete)'
		const deleteOrgUsers = await sequelize.query(DELETE_USER_ORGS_QUERY, {
			replacements: { userIdsToDelete },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})

		// fetch user org roles to delete
		const DELETE_USERS_QUERY = 'DELETE FROM users WHERE id IN (:userIdsToDelete)'
		const deleteUsers = await sequelize.query(DELETE_USERS_QUERY, {
			replacements: { userIdsToDelete },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})

		const TRUNCATE_UPLOADS_QUERY = 'TRUNCATE TABLE file_uploads RESTART IDENTITY'
		const truncateUploads = await sequelize.query(TRUNCATE_UPLOADS_QUERY, {
			type: Sequelize.QueryTypes.RAW,
			raw: true,
		})

		const TRUNCATE_INVITES_QUERY = 'TRUNCATE TABLE organization_user_invites RESTART IDENTITY'
		const truncateInvites = await sequelize.query(TRUNCATE_INVITES_QUERY, {
			type: Sequelize.QueryTypes.RAW,
			raw: true,
		})

		const DELETE_ORG_FEATURES_QUERY =
			'DELETE FROM organization_features WHERE organization_code IN (:orgsCodesToRemove)'
		const deleteOrganizationFeatures = await sequelize.query(DELETE_ORG_FEATURES_QUERY, {
			replacements: { orgsCodesToRemove },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})

		const DELETE_ORG_DOMAINS_QUERY =
			'DELETE FROM organization_email_domains WHERE organization_id IN (:orgsToRemove)'
		const deleteOrganizationDomains = await sequelize.query(DELETE_ORG_DOMAINS_QUERY, {
			replacements: { orgsToRemove },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})

		const DELETE_ORG_ROLE_REQUEST_QUERY =
			'DELETE FROM organization_role_requests WHERE organization_id IN (:orgsToRemove)'
		const deleteOrganizatioRoleRequest = await sequelize.query(DELETE_ORG_ROLE_REQUEST_QUERY, {
			replacements: { orgsToRemove },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})

		const DELETE_ORGS_QUERY = 'DELETE FROM organizations WHERE id IN (:orgsToRemove)'
		const deleteOrganizations = await sequelize.query(DELETE_ORGS_QUERY, {
			replacements: { orgsToRemove },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})

		const DELETE_TENANT_DOMAINS_QUERY = 'DELETE FROM tenant_domains WHERE tenant_code NOT IN (:allowed_tenants)'
		const deleteTenantDomains = await sequelize.query(DELETE_TENANT_DOMAINS_QUERY, {
			replacements: { allowed_tenants },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})
		const DELETE_TENANTS_QUERY = 'DELETE FROM tenants WHERE code NOT IN (:allowed_tenants)'
		const deleteTenants = await sequelize.query(DELETE_TENANTS_QUERY, {
			replacements: { allowed_tenants },
			type: Sequelize.QueryTypes.DELETE,
			raw: true,
		})
	} catch (error) {
		console.error(`Error creating function: ${error}`)
	} finally {
		sequelize.close()
	}
})()
