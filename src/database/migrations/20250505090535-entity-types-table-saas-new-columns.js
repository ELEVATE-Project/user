'use strict'
const tableName = 'entity_types'
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// 1. Add as nullable
		await queryInterface.addColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// 2. Set value for existing records
		await queryInterface.sequelize.query(`
      UPDATE ${tableName} SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
    `)
		// 3. Change column to not allow nulls
		await queryInterface.changeColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: false,
		})

		let isDistributed = false
		try {
			// 0. Check if table is distributed and remove distribution
			const distributionCheckResult = await queryInterface.sequelize.query(`
          SELECT 1 FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass
        `)
			isDistributed = distributionCheckResult[0].length > 0
		} catch (error) {
			isDistributed = false
		}

		if (isDistributed) {
			console.log(`Removing distribution for table: ${tableName}`)
			await queryInterface.sequelize.query(`
        SELECT master_remove_distributed_table('${tableName}');
      `)
		}
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)

		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id", "organization_id", "tenant_code")
    `)
	},

	down: async (queryInterface, Sequelize) => {
		// 1. Drop composite primary key
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)

		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id", "organization_id")
    `)
		await queryInterface.removeColumn(tableName, 'tenant_code')
	},
}
