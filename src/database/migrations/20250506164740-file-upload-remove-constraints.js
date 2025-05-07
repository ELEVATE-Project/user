'use strict'
const tableName = 'file_uploads'
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if Citus extension is enabled
		let isCitusEnabled = false
		try {
			const [extensionCheckResult] = await queryInterface.sequelize.query(`
        SELECT 1 FROM pg_extension WHERE extname = 'citus';
      `)
			isCitusEnabled = extensionCheckResult.length > 0
		} catch (error) {
			console.error('Error checking Citus extension:', error.message)
			isCitusEnabled = false // Assume Citus is not enabled if the query fails
		}

		try {
			const [constraints] = await queryInterface.sequelize.query(`
	SELECT conname 
	FROM pg_constraint 
	WHERE conrelid = '${tableName}'::regclass AND contype = 'p';
`)
			if (constraints.length > 0) {
				const constraintName = constraints[0].conname
				await queryInterface.sequelize.query(`
		ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraintName}";
	`)
			}
		} catch (error) {
			console.error('Error dropping primary key:', error)
		}
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("tenant_code" , "id")
    `)
		if (isCitusEnabled) {
			await queryInterface.sequelize.query(`
        SELECT create_distributed_table('${tableName}', 'tenant_code');
      `)
		}
	},

	down: async (queryInterface, Sequelize) => {
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
		// 1. Drop composite primary key
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)
	},
}
