'use strict'
require('module-alias/register')
const common = require('@constants/common')
const utils = require('@generics/utils')
module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const existingData = await queryInterface.sequelize.query('SELECT * FROM organization_user_invites')
			const encEmails = [
				...new Set(
					existingData[0].map((data) => {
						return data.email
					})
				),
			]
			let existingUsers = {},
				usersMap = new Map(),
				orgCodeMap = new Map()
			if (encEmails.length > 0) {
				existingUsers = await queryInterface.sequelize.query(
					'SELECT users.*, uo.organization_code AS ORG_CODE FROM users LEFT JOIN ( SELECT user_id, organization_code, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY organization_code ASC) as rn FROM user_organizations) uo ON users.id = uo.user_id AND uo.rn = 1 WHERE users.email IN (:emails) AND users.deleted_at IS NULL',
					{
						replacements: { emails: encEmails },
						type: queryInterface.sequelize.QueryTypes.SELECT,
					}
				)
				// Convert array to Map with email as key
				usersMap = new Map(existingUsers.map((user) => [user.email, user]))

				const orgCodeArr = [...new Set(existingUsers.map((user) => user.org_code))]
				const orgs = await queryInterface.sequelize.query(
					'SELECT * FROM organizations WHERE code IN (:orgCodes) ',
					{
						replacements: { orgCodes: orgCodeArr },
						type: queryInterface.sequelize.QueryTypes.SELECT,
					}
				)
				orgCodeMap = new Map(orgs.map((org) => [org.code, org.id]))
			}

			await queryInterface.addColumn('organization_user_invites', 'username', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn('organization_user_invites', 'name', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn('organization_user_invites', 'phone', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})
			await queryInterface.addColumn('organization_user_invites', 'phone_code', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})
			await queryInterface.addColumn('organization_user_invites', 'meta', {
				type: Sequelize.JSON,
				allowNull: false,
				defaultValue: {},
			})

			await queryInterface.addColumn('organization_user_invites', 'type', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn('organization_user_invites', 'invitation_key', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn('organization_user_invites', 'invitation_id', {
				type: Sequelize.INTEGER,
				allowNull: true,
			})

			await queryInterface.addColumn('organization_user_invites', 'tenant_code', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			// Modify existing email column to allow NULL
			await queryInterface.changeColumn('organization_user_invites', 'email', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			const [results] = await queryInterface.sequelize.query(
				`SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = 'organization_user_invites' 
         AND constraint_name = 'org_user_invites_pkey' 
         AND constraint_type = 'PRIMARY KEY'`
			)

			// Remove the constraint if it exists
			if (results.length > 0) {
				await queryInterface.removeConstraint('organization_user_invites', 'org_user_invites_pkey')
				console.log('Primary key constraint org_user_invites_pkey removed.')
			} else {
				console.log('Primary key constraint org_user_invites_pkey not found.')
			}

			encEmails.forEach(async (email) => {
				const fetchUser = usersMap.get(email)
				if (fetchUser?.id) {
					// Update query for organization_user_invites
					const updatedRows = await queryInterface.bulkUpdate(
						'organization_user_invites',
						{
							username: fetchUser.username,
							type: common.TYPE_UPLOAD,
							invitation_key: utils.generateUUID(),
							invitation_id: 0,
							tenant_code: fetchUser.tenant_code,
							status: fetchUser.status,
							meta: fetchUser.meta,
							updated_at: new Date(),
							phone: fetchUser?.phone || null,
							phone_code: fetchUser?.phone_code || null,
						},
						{
							email: fetchUser.email,
						}
					)
				}
			})

			// Add new composite primary key (id, organization_id, tenant_code)
			await queryInterface.addConstraint('organization_user_invites', {
				fields: ['id', 'organization_id', 'tenant_code'],
				type: 'primary key',
				name: 'org_user_invites_pkey',
			})

			// Add unique constraint on invitation_key
			await queryInterface.addConstraint('organization_user_invites', {
				fields: ['invitation_key'],
				type: 'unique',
				name: 'org_user_invites_invitation_key_unique',
			})
		} catch (error) {
			console.error('Error : ', error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.transaction(async (t) => {
			// Remove new columns
			await queryInterface.removeColumn('organization_user_invites', 'phone', { transaction: t })
			await queryInterface.removeColumn('organization_user_invites', 'phone_code', { transaction: t })
			await queryInterface.removeColumn('organization_user_invites', 'username', { transaction: t })
			await queryInterface.removeColumn('organization_user_invites', 'type', { transaction: t })
			await queryInterface.removeColumn('organization_user_invites', 'invitation_key', { transaction: t })
			await queryInterface.removeColumn('organization_user_invites', 'invitation_id', { transaction: t })
			await queryInterface.removeColumn('organization_user_invites', 'meta', { transaction: t })
			await queryInterface.removeColumn('organization_user_invites', 'tenant_code', { transaction: t })
		})
	},
}
