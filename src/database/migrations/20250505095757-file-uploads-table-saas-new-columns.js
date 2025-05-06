'use strict'
const tableName = 'file_uploads'
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// 1. Add as nullable
		await queryInterface.addColumn('file_uploads', 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// 2. Set value for existing records
		await queryInterface.sequelize.query(`
      UPDATE file_uploads SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
    `)
		// 3. Change column to not allow nulls
		await queryInterface.changeColumn('file_uploads', 'tenant_code', {
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
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("input_path", "organization_id" , "tenant_code")
    `)
	},

	down: async (queryInterface, Sequelize) => {
		// 1. Drop composite primary key
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)

		await queryInterface.removeColumn(tableName, 'tenant_code')
	},
}
