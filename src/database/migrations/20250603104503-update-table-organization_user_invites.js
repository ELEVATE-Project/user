'use strict'
require('module-alias/register')
const common = require('@constants/common')
const utils = require('@generics/utils')

async function checkCitus(queryInterface) {
	let isCitusEnabled = false

	try {
		const [extensionCheckResult] = await queryInterface.sequelize.query(`
            SELECT 1 FROM pg_extension WHERE extname = 'citus';
        `)
		isCitusEnabled = extensionCheckResult.length > 0
	} catch (error) {
		console.error('Error checking Citus extension:', error.message)
		isCitusEnabled = false
	}

	return isCitusEnabled
}

const tableName = 'organization_user_invites'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		let isDistributed = false
		const isCitusEnabled = await checkCitus(queryInterface)
		try {
			const distributionCheckResult = await queryInterface.sequelize.query(`
                SELECT 1 FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass
            `)
			isDistributed = distributionCheckResult[0].length > 0
		} catch (error) {
			isDistributed = false
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
                    SELECT undistribute_table('${queryInterface.quoteIdentifier(
						tableName
					)}', cascade_via_foreign_keys=>true);
                `)
			} catch (error) {
				console.error('Error in undistribution:', error.message)
				throw error
			}
		}

		try {
			try {
				await queryInterface.sequelize.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`)
				console.log(`Table ${tableName} truncated successfully.`)
			} catch (error) {
				console.error(`Error truncating table ${tableName}:`, error.message)
				throw error // Re-throw to fail migration on error
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
				allowNull: true,
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

			await queryInterface.addColumn(tableName, 'organization_code', {
				type: Sequelize.STRING(255),
				primaryKey: true,
				allowNull: true,
			})

			await queryInterface.addColumn(tableName, 'tenant_code', {
				type: Sequelize.STRING(255),
				allowNull: true,
			})

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

			if (results.length > 0) {
				await queryInterface.removeConstraint(tableName, 'org_user_invites_pkey')
				console.log('Primary key constraint org_user_invites_pkey removed.')
			} else {
				console.log('Primary key constraint org_user_invites_pkey not found.')
			}

			await queryInterface.changeColumn(tableName, 'type', {
				type: Sequelize.STRING(255),
				allowNull: false,
			})
			await queryInterface.changeColumn(tableName, 'invitation_id', {
				type: Sequelize.INTEGER,
				allowNull: false,
			})
			await queryInterface.changeColumn(tableName, 'organization_code', {
				type: Sequelize.STRING(255),
				allowNull: false,
			})
			await queryInterface.changeColumn(tableName, 'tenant_code', {
				type: Sequelize.STRING(255),
				allowNull: false,
				primaryKey: true,
			})

			await queryInterface.addConstraint(tableName, {
				fields: ['id', 'organization_code', 'tenant_code'],
				type: 'primary key',
				name: 'org_user_invites_pkey',
			})
			// Add unique constraint on invitation_key and tenant_code
			await queryInterface.addConstraint(tableName, {
				fields: ['invitation_key', 'tenant_code'],
				type: 'unique',
				name: 'invitations_invitation_key_tenant_code_unique',
			})

			await queryInterface.addConstraint(tableName, {
				fields: ['invitation_id', 'tenant_code'],
				type: 'foreign key',
				name: 'fk_invitation_id',
				references: {
					table: 'invitations',
					fields: ['id', 'tenant_code'],
				},
				onUpdate: 'NO ACTION',
				onDelete: 'CASCADE',
			})

			if (isCitusEnabled) {
				await queryInterface.sequelize.query(`
                    SELECT create_distributed_table('${tableName}', 'tenant_code');
                `)
			}
		} catch (error) {
			console.error('Error: ', error)
			throw error // Re-throw to fail migration on error
		}
	},

	down: async (queryInterface, Sequelize) => {
		const isCitusEnabled = await checkCitus(queryInterface)

		await queryInterface.sequelize.transaction(async (t) => {
			try {
				const [foreignKeys] = await queryInterface.sequelize.query(`
					SELECT
						tc.constraint_name,
						tc.table_name
					FROM
						information_schema.table_constraints AS tc
						JOIN information_schema.constraint_table_usage AS ctu
						ON tc.constraint_name = ctu.constraint_name
					WHERE
						tc.constraint_type = 'FOREIGN KEY'
						AND ctu.table_name = 'invitations';
				`)

				for (const fk of foreignKeys) {
					console.log(`Removing foreign key ${fk.constraint_name} from table ${fk.table_name}`)
					await queryInterface.removeConstraint(fk.table_name, fk.constraint_name)
				}
			} catch (error) {
				console.error('Error removing foreign key constraints:', error.message)
			}
			if (isCitusEnabled) {
				await queryInterface.sequelize.query(`
                    SELECT undistribute_table('${queryInterface.quoteIdentifier(tableName)}');
                `)
			}

			try {
				await queryInterface.removeConstraint(tableName, 'org_user_invites_invitation_key_unique', {
					transaction: t,
				})
			} catch (error) {
				console.log('Unique constraint org_user_invites_invitation_key_unique not found, skipping.')
			}

			try {
				await queryInterface.removeConstraint(tableName, 'org_user_invites_pkey', { transaction: t })
			} catch (error) {
				console.log('Primary key org_user_invites_pkey not found, skipping.')
			}

			await queryInterface.removeColumn(tableName, 'phone', { transaction: t })
			await queryInterface.removeColumn(tableName, 'name', { transaction: t })
			await queryInterface.removeColumn(tableName, 'phone_code', { transaction: t })
			await queryInterface.removeColumn(tableName, 'username', { transaction: t })
			await queryInterface.removeColumn(tableName, 'type', { transaction: t })
			await queryInterface.removeColumn(tableName, 'invitation_key', { transaction: t })
			await queryInterface.removeColumn(tableName, 'invitation_id', { transaction: t })
			await queryInterface.removeColumn(tableName, 'organization_code', { transaction: t })
			await queryInterface.removeColumn(tableName, 'meta', { transaction: t })
			await queryInterface.removeColumn(tableName, 'tenant_code', { transaction: t })
		})
	},
}
