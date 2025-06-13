'use strict'
require('module-alias/register')
const common = require('@constants/common')
const utils = require('@generics/utils')
module.exports = {
	up: async (queryInterface, Sequelize) => {
		let isDistributed = false
		const tableName = 'organization_user_invites'
		let isCitusEnabled = false

		try {
			// Check if table is distributed
			const distributionCheckResult = await queryInterface.sequelize.query(`
                SELECT 1 FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass
            `)
			isDistributed = distributionCheckResult[0].length > 0
		} catch (error) {
			isDistributed = false
		}
		try {
			const [extensionCheckResult] = await queryInterface.sequelize.query(`
        SELECT 1 FROM pg_extension WHERE extname = 'citus';
      `)
			isCitusEnabled = extensionCheckResult.length > 0
		} catch (error) {
			console.error('Error checking Citus extension:', error.message)
			isCitusEnabled = false // Assume Citus is not enabled if the query fails
		}
		if (isDistributed) {
			try {
				const [foreignKeys] = await queryInterface.sequelize.query(`
                    SELECT conname 
                    FROM pg_constraint 
                    WHERE conrelid = '${tableName}'::regclass AND contype = 'f';
                `)
				for (const fk of foreignKeys) {
					await queryInterface.sequelize.query(`
                        ALTER TABLE "${tableName}" DROP CONSTRAINT "${fk.conname}";
                    `)
				}

				await queryInterface.sequelize.query(`
                    SELECT undistribute_table('${queryInterface.quoteIdentifier(tableName)}');
                `)
			} catch (error) {
				console.error('Error in undistribution:', error.message)
				throw error
			}
		}
		try {
			const existingData = await queryInterface.sequelize.query(`SELECT * FROM ${tableName}`)
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

			await queryInterface.addColumn(tableName, 'username', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn(tableName, 'name', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn(tableName, 'phone', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})
			await queryInterface.addColumn(tableName, 'phone_code', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})
			await queryInterface.addColumn(tableName, 'meta', {
				type: Sequelize.JSON,
				allowNull: false,
				defaultValue: {},
			})

			await queryInterface.addColumn(tableName, 'type', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn(tableName, 'invitation_key', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			await queryInterface.addColumn(tableName, 'invitation_id', {
				type: Sequelize.INTEGER,
				allowNull: true,
			})

			await queryInterface.addColumn(tableName, 'tenant_code', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			// Modify existing email column to allow NULL
			await queryInterface.changeColumn(tableName, 'email', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

			const [results] = await queryInterface.sequelize.query(
				`SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = '${tableName}' 
         AND constraint_name = 'org_user_invites_pkey' 
         AND constraint_type = 'PRIMARY KEY'`
			)

			// Remove the constraint if it exists
			if (results.length > 0) {
				await queryInterface.removeConstraint(tableName, 'org_user_invites_pkey')
				console.log('Primary key constraint org_user_invites_pkey removed.')
			} else {
				console.log('Primary key constraint org_user_invites_pkey not found.')
			}

			encEmails.forEach(async (email) => {
				const fetchUser = usersMap.get(email)
				if (fetchUser?.id) {
					// Update query for organization_user_invites
					const updatedRows = await queryInterface.bulkUpdate(
						tableName,
						{
							username: fetchUser.username,
							type: common.TYPE_UPLOAD,
							invitation_key: utils.generateUUID(),
							invitation_id: 0,
							tenant_code: fetchUser?.tenant_code,
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
				} else {
					const updatedRows = await queryInterface.bulkUpdate(
						tableName,
						{
							username: '',
							type: common.TYPE_UPLOAD,
							invitation_key: utils.generateUUID(),
							invitation_id: 0,
							tenant_code: process.env.DEFAULT_TENANT_CODE || 'default',
							status: common.UPLOADED_STATUS,
							meta: {},
							updated_at: new Date(),
							phone: null,
							phone_code: null,
						},
						{
							email,
						}
					)
				}
			})

			// Add new composite primary key (id, organization_id, tenant_code)
			await queryInterface.addConstraint(tableName, {
				fields: ['id', 'organization_id', 'tenant_code'],
				type: 'primary key',
				name: 'org_user_invites_pkey',
			})

			// Add unique constraint on invitation_key
			await queryInterface.addConstraint(tableName, {
				fields: ['invitation_key', 'tenant_code'],
				type: 'unique',
				name: 'org_user_invites_invitation_key_unique',
			})
			if (isCitusEnabled) {
				await queryInterface.sequelize.query(`
			SELECT create_distributed_table('${tableName}', 'tenant_code');
		  `)
			}
		} catch (error) {
			console.error('Error : ', error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		const tableName = 'organization_user_invites'
		await queryInterface.sequelize.transaction(async (t) => {
			// Remove new columns
			await queryInterface.removeColumn(tableName, 'phone', { transaction: t })
			await queryInterface.removeColumn(tableName, 'name', { transaction: t })
			await queryInterface.removeColumn(tableName, 'phone_code', { transaction: t })
			await queryInterface.removeColumn(tableName, 'username', { transaction: t })
			await queryInterface.removeColumn(tableName, 'type', { transaction: t })
			await queryInterface.removeColumn(tableName, 'invitation_key', { transaction: t })
			await queryInterface.removeColumn(tableName, 'invitation_id', { transaction: t })
			await queryInterface.removeColumn(tableName, 'meta', { transaction: t })
			await queryInterface.removeColumn(tableName, 'tenant_code', { transaction: t })
		})
	},
}
