'use strict'

/** @type {import('sequelize-cli').Migration} */
const tableName = 'notification_templates'

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
module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		const isDistributedCheck = await isDistributed(queryInterface, tableName)
		const isCitusEnabled = await checkCitus(queryInterface) // Non-DB operation, no transaction needed
		let isCommitted = false
		try {
			if (isCitusEnabled && isDistributedCheck) {
				try {
					await queryInterface.sequelize.query(
						`
            SELECT undistribute_table('${queryInterface.quoteIdentifier(tableName)}');
        `,
						{ transaction }
					)
				} catch (error) {
					console.log(error)
				}
			}

			// Add the organization_code column
			await queryInterface.addColumn(
				tableName,
				'organization_code',
				{
					type: Sequelize.STRING(255),
					allowNull: true,
				},
				{ transaction }
			)

			// Update organization_code with values from organizations table
			await queryInterface.sequelize.query(
				`
        UPDATE ${tableName}
        SET organization_code = organizations.code
        FROM organizations
        WHERE ${tableName}.organization_id = organizations.id AND ${tableName}.tenant_code = organizations.tenant_code;
        `,
				{ transaction }
			)

			await queryInterface.changeColumn(
				tableName,
				'organization_code',
				{
					type: Sequelize.STRING(255),
					allowNull: false,
				},
				{ transaction }
			)

			const constraintExists = await queryInterface.sequelize.query(
				`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = :tableName
        AND constraint_name = :constraintName
        AND constraint_type = 'UNIQUE'
        `,
				{
					replacements: {
						tableName,
						constraintName: 'unique_type_code_organization_id_tenant_code',
					},
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				}
			)
			if (constraintExists.length > 0) {
				await queryInterface.removeConstraint(tableName, 'unique_type_code_organization_id_tenant_code', {
					transaction,
				})
			}

			await transaction.commit()
			isCommitted = true
		} catch (error) {
			// Rollback the transaction on error
			await transaction.rollback()
			throw error
		}

		// split the transaction to create indexes

		if (isCommitted) {
			const transaction = await queryInterface.sequelize.transaction()
			try {
				await queryInterface.addConstraint(
					tableName,
					{
						fields: ['type', 'code', 'organization_code', 'tenant_code'],
						type: 'unique',
						name: 'unique_type_code_organization_code_tenant_code',
					},
					{ transaction }
				)

				await queryInterface.removeColumn(tableName, 'organization_id')

				if (isCitusEnabled) {
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
			} catch (error) {
				// Rollback the transaction on error
				await transaction.rollback()
				throw error
			}
		}
	},

	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		let isCommitted = false
		const isDistributedCheck = await isDistributed(queryInterface, tableName)
		const isCitusEnabled = await checkCitus(queryInterface) // Non-DB operation, no transaction needed
		try {
			if (isCitusEnabled && isDistributedCheck) {
				try {
					await queryInterface.sequelize.query(
						`
            SELECT undistribute_table('${queryInterface.quoteIdentifier(tableName)}');
        `,
						{ transaction }
					)
				} catch (error) {
					console.log(error)
				}
			}
			// Add the organization_code column
			await queryInterface.addColumn(
				tableName,
				'organization_id',
				{
					type: Sequelize.INTEGER,
					allowNull: true,
				},
				{ transaction }
			)
			// Update organization_code with values from organizations table
			await queryInterface.sequelize.query(
				`
        UPDATE ${tableName}
        SET organization_id = organizations.id
        FROM organizations
        WHERE ${tableName}.organization_code = organizations.code AND ${tableName}.tenant_code = organizations.tenant_code;
        `,
				{ transaction }
			)

			await queryInterface.changeColumn(
				tableName,
				'organization_code',
				{
					type: Sequelize.STRING(255),
					allowNull: false,
				},
				{ transaction }
			)

			const constraintExists = await queryInterface.sequelize.query(
				`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = :tableName
        AND constraint_name = :constraintName
        AND constraint_type = 'UNIQUE'
        `,
				{
					replacements: {
						tableName,
						constraintName: 'unique_type_code_organization_code_tenant_code',
					},
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				}
			)
			if (constraintExists.length > 0) {
				await queryInterface.removeConstraint(tableName, 'unique_type_code_organization_code_tenant_code', {
					transaction,
				})
			}

			// Commit the transaction
			await transaction.commit()
			isCommitted = true
		} catch (error) {
			// Rollback the transaction on error
			await transaction.rollback()
			throw error
		}

		if (isCommitted) {
			const transaction = await queryInterface.sequelize.transaction()
			try {
				await queryInterface.addConstraint(
					tableName,
					{
						fields: ['type', 'code', 'organization_id', 'tenant_code'],
						type: 'unique',
						name: 'unique_type_code_organization_id_tenant_code',
					},
					{ transaction }
				)
				// Remove the organization_code column
				await queryInterface.removeColumn('notification_templates', 'organization_code', { transaction })

				if (isCitusEnabled) {
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

				// Commit the transaction
				await transaction.commit()
			} catch (error) {
				// Rollback the transaction on error
				await transaction.rollback()
				throw error
			}
		}
	},
}
