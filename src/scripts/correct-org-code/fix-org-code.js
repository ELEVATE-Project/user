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
	let transaction
	try {
		// Start a transaction
		transaction = await sequelize.transaction()

		const DISABLE_FK_QUERY = 'SET CONSTRAINTS ALL DEFERRED' // temporarily remove constraint checks till the transaction is completed

		const ORG_UPDATE_QUERY = `UPDATE organizations SET code = REGEXP_REPLACE(code, '\s+', '', 'g') WHERE code ~ '\s+';`
		const ORG_FETCH_QUERY = `SELECT id, name, code FROM organizations WHERE code ~ '\s+';`

		// Test database connection
		await sequelize.authenticate()
		console.log('Database connection established successfully.')
		await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
		// Execute the query with replacements
		const updateOrgs = await sequelize.query(ORG_UPDATE_QUERY, {
			type: Sequelize.QueryTypes.UPDATE,
			raw: true,
			transaction,
		})
		// Execute the query with replacements
		const fetchOrgs = await sequelize.query(ORG_FETCH_QUERY, {
			type: Sequelize.QueryTypes.UPDATE,
			raw: true,
			transaction,
		})

		console.log(fetchOrgs)
		if (transaction) await transaction.rollback()
		/*
        const orgsToRemove = fetchOrgs
            .filter((orgs) => orgs.code !== process.env.DEFAULT_ORGANISATION_CODE)
            .map((orgs) => orgs.id)
        const orgsCodesToRemove = fetchOrgs
            .map((orgs) => orgs.code)
            .filter((code) => code !== process.env.DEFAULT_ORGANISATION_CODE)
        console.info('Organizations to remove: ', fetchOrgs)

        // Fetch system admin and org admin roles
        const allowedRoles = ['admin', 'org_admin']
        const ROLES_FETCH_QUERY =
            'SELECT id FROM user_roles WHERE tenant_code IN (:allowedTenants) AND title IN (:allowedRoles)'
        const fetchRoles = await sequelize.query(ROLES_FETCH_QUERY, {
            replacements: { allowedTenants: allowed_tenants, allowedRoles },
            type: Sequelize.QueryTypes.SELECT,
            raw: true,
            transaction
        })

        const systemRoles = fetchRoles.map((role) => role.id)
        console.log('System Role ids: ', systemRoles)

        const FETCH_USERID_QUERY = 'SELECT user_id FROM user_organization_roles WHERE role_id IN (:systemRoles)'
        const fetchUserIds = await sequelize.query(FETCH_USERID_QUERY, {
            replacements: { orgsCodesToRemove, systemRoles, allowedTenants: allowed_tenants },
            type: Sequelize.QueryTypes.SELECT,
            raw: true,
            transaction
        })

        const adminRoles = fetchUserIds.map((user) => user.user_id)

        const REFETCH_USERID_QUERY =
            'SELECT user_id FROM user_organization_roles WHERE user_id NOT IN (:adminRoles) OR organization_code IN (:orgsCodesToRemove)'
        const reFetchUserIds = await sequelize.query(REFETCH_USERID_QUERY, {
            replacements: { adminRoles, orgsCodesToRemove },
            type: Sequelize.QueryTypes.SELECT,
            raw: true,
            transaction
        })

        const userIdsToDelete = reFetchUserIds.map((user) => user.user_id)
        console.log('User ids to delete: ', userIdsToDelete)

        // Delete user org roles
        const DELETE_USER_ORG_ROLES_QUERY = 'DELETE FROM user_organization_roles WHERE user_id IN (:userIdsToDelete)'
        await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
        const deleteOrgUserRoles = await sequelize.query(DELETE_USER_ORG_ROLES_QUERY, {
            replacements: { userIdsToDelete },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Delete user organizations
        const DELETE_USER_ORGS_QUERY = 'DELETE FROM user_organizations WHERE user_id IN (:userIdsToDelete)'
        await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
        const deleteOrgUsers = await sequelize.query(DELETE_USER_ORGS_QUERY, {
            replacements: { userIdsToDelete },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Delete users
        const DELETE_USERS_QUERY = 'DELETE FROM users WHERE id IN (:userIdsToDelete)'
        await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
        const deleteUsers = await sequelize.query(DELETE_USERS_QUERY, {
            replacements: { userIdsToDelete },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Truncate uploads
        const TRUNCATE_UPLOADS_QUERY = 'TRUNCATE TABLE file_uploads RESTART IDENTITY'
        const truncateUploads = await sequelize.query(TRUNCATE_UPLOADS_QUERY, {
            type: Sequelize.QueryTypes.RAW,
            raw: true,
            transaction
        })

        // Truncate invites
        const TRUNCATE_INVITES_QUERY = 'TRUNCATE TABLE organization_user_invites RESTART IDENTITY'
        const truncateInvites = await sequelize.query(TRUNCATE_INVITES_QUERY, {
            type: Sequelize.QueryTypes.RAW,
            raw: true,
            transaction
        })

        // Delete organization features
        const DELETE_ORG_FEATURES_QUERY =
            'DELETE FROM organization_features WHERE organization_code IN (:orgsCodesToRemove)'
        await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
        const deleteOrganizationFeatures = await sequelize.query(DELETE_ORG_FEATURES_QUERY, {
            replacements: { orgsCodesToRemove },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Delete organization domains
        const DELETE_ORG_DOMAINS_QUERY =
            'DELETE FROM organization_email_domains WHERE organization_id IN (:orgsToRemove)'
        await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
        const deleteOrganizationDomains = await sequelize.query(DELETE_ORG_DOMAINS_QUERY, {
            replacements: { orgsToRemove },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Delete organization role requests
        const DELETE_ORG_ROLE_REQUEST_QUERY =
            'DELETE FROM organization_role_requests WHERE organization_id IN (:orgsToRemove)'
        const deleteOrganizatioRoleRequest = await sequelize.query(DELETE_ORG_ROLE_REQUEST_QUERY, {
            replacements: { orgsToRemove },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Delete organizations
        const DELETE_ORGS_QUERY = 'DELETE FROM organizations WHERE id IN (:orgsToRemove)'
        await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
        const deleteOrganizations = await sequelize.query(DELETE_ORGS_QUERY, {
            replacements: { orgsToRemove },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Delete tenant domains
        const DELETE_TENANT_DOMAINS_QUERY = 'DELETE FROM tenant_domains WHERE tenant_code NOT IN (:allowed_tenants)'
        const deleteTenantDomains = await sequelize.query(DELETE_TENANT_DOMAINS_QUERY, {
            replacements: { allowed_tenants },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Delete tenants
        const DELETE_TENANTS_QUERY = 'DELETE FROM tenants WHERE code NOT IN (:allowed_tenants)'
        await sequelize.query(DISABLE_FK_QUERY, { type: Sequelize.QueryTypes.RAW, raw: true, transaction })
        const deleteTenants = await sequelize.query(DELETE_TENANTS_QUERY, {
            replacements: { allowed_tenants },
            type: Sequelize.QueryTypes.DELETE,
            raw: true,
            transaction
        })

        // Commit the transaction
        await transaction.commit(); */
		console.log('Transaction committed successfully.')
	} catch (error) {
		// Rollback transaction on error
		if (transaction) await transaction.rollback()
		console.error(`Error during transaction: ${error}`)
	} finally {
		sequelize.close()
	}
})()
