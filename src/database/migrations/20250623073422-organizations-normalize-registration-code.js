'use strict'

async function checkCitus(queryInterface) {
	let isCitusEnabled = false

	try {
		const extensionCheckResult = await queryInterface.sequelize.query(
			`
      SELECT 1 FROM pg_extension WHERE extname = 'citus';
    `,
			{ type: queryInterface.sequelize.QueryTypes.SELECT }
		)
		isCitusEnabled = extensionCheckResult.length > 0
	} catch (error) {
		console.error('Error checking Citus extension:', error.message)
		isCitusEnabled = false
	}

	return isCitusEnabled
}

async function isDistributed(queryInterface, tableName) {
	let isDistributed = false
	try {
		// Check if table is distributed
		const distributionCheckResult = await queryInterface.sequelize.query(`
                SELECT 1 FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass
            `)
		isDistributed = distributionCheckResult[0].length > 0
	} catch (error) {
		isDistributed = false
	}

	return isDistributed
}

const tableName = 'organization_registration_codes'

module.exports = {
	async up(queryInterface, Sequelize) {
		// Start a transaction
		await queryInterface.sequelize.transaction(async (transaction) => {
			// All DB operations use the transaction
			await queryInterface.createTable(
				tableName,
				{
					id: {
						type: Sequelize.INTEGER,
						allowNull: false,
						primaryKey: true,
						autoIncrement: true,
					},
					registration_code: {
						type: Sequelize.STRING(32),
						allowNull: false,
					},
					organization_code: {
						type: Sequelize.STRING,
						allowNull: false,
					},
					status: {
						type: Sequelize.STRING,
						allowNull: false,
						defaultValue: 'ACTIVE',
					},
					created_by: {
						type: Sequelize.INTEGER,
						allowNull: false,
					},
					tenant_code: {
						type: Sequelize.STRING,
						allowNull: false,
						primaryKey: true,
					},
					created_at: {
						type: Sequelize.DATE,
						allowNull: false,
					},
					updated_at: {
						type: Sequelize.DATE,
						allowNull: false,
					},
					deleted_at: {
						type: Sequelize.DATE,
						allowNull: true,
					},
				},
				{ transaction }
			)
		})

		return queryInterface.sequelize.transaction(async (transaction) => {
			const isCitusEnabled = await checkCitus(queryInterface) // Non-DB operation, no transaction needed

			const organizations = await queryInterface.sequelize.query(
				`SELECT * FROM organizations WHERE registration_code IS NOT NULL`,
				{
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				}
			)

			// Prepare data for bulk insert
			const regCodeFinalArray = organizations.map((index) => ({
				registration_code: index.registration_code,
				organization_code: index.code,
				status: index.status,
				created_by: index.created_by,
				tenant_code: index.tenant_code,
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: index.deleted_at ? index.deleted_at : null,
			}))
			if (regCodeFinalArray.length > 0) {
				// Perform bulk insert
				await queryInterface.bulkInsert({ tableName, schema: 'public' }, regCodeFinalArray, { transaction })
			}
			await queryInterface.addIndex(
				{ tableName, schema: 'public' },
				['registration_code', 'organization_code', 'tenant_code'],
				{
					name: 'index_registration_code_organization_code_tenant_code',
					unique: true,
					transaction,
				}
			)

			await queryInterface.addIndex({ tableName, schema: 'public' }, ['organization_code', 'tenant_code'], {
				name: 'index_organization_code_tenant_code',
				transaction,
			})
			await queryInterface.addConstraint(
				{ tableName, schema: 'public' },
				{
					fields: ['organization_code', 'tenant_code'],
					type: 'foreign key',
					name: 'fk_organization_code_tenant_code_in_org_reg_code',
					references: {
						table: 'organizations',
						fields: ['code', 'tenant_code'],
					},
					onUpdate: 'NO ACTION',
					onDelete: 'CASCADE',
					transaction,
				}
			)
			const isDistributedCheck = await isDistributed(queryInterface, tableName)
			console.log(
				'isDistributedCheck ',
				isCitusEnabled,
				isDistributedCheck,
				isCitusEnabled && !isDistributedCheck
			)
			// Distribute table if Citus is enabled
			if (isCitusEnabled && !isDistributedCheck) {
				try {
					await queryInterface.sequelize.query(
						`
          SELECT create_distributed_table('${tableName}', 'tenant_code');
        `,
						{ transaction }
					)
				} catch (error) {
					console.log(error)
				}
			}
		})
	},

	async down(queryInterface, Sequelize) {
		// Start a transaction
		return queryInterface.sequelize.transaction(async (transaction) => {
			await queryInterface.addColumn('organizations', 'registration_code', {
				type: Sequelize.STRING(32),
				allowNull: true,
			})
			const reg = await queryInterface.sequelize.query(`SELECT * FROM ${tableName}`, {
				type: queryInterface.sequelize.QueryTypes.SELECT,
				transaction,
			})

			// Prepare data for bulk insert
			const orgPromise = reg.map((index) => {
				return queryInterface.bulkUpdate(
					'organizations',
					{ registration_code: index.registration_code },
					{
						code: index.organization_code,
					}
				)
			})

			await Promise.all(orgPromise)
			// Drop table
			await queryInterface.dropTable(tableName, { transaction })
		})
	},
}
