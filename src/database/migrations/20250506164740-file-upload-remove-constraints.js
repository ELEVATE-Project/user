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

		console.log('IS CITUS ENABLED: ----->>>>> ', isCitusEnabled)
		// Drop existing primary key
		try {
			console.log(`Dropping existing primary key on ${tableName}`)
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
				console.log('Primary key dropped successfully:', constraintName)
			}
		} catch (error) {
			console.error('Error dropping primary key:', error)
		}
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("tenant_code" , "organization_id" , "input_path")
    `)
		if (isCitusEnabled) {
			console.log(`Redistributing table: ${tableName} on tenant_code`)
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

		console.log('IS DISTRIBUTED : : :  : ----->>>>> ', isDistributed)

		if (isDistributed) {
			try {
				// Drop foreign keys
				console.log('Dropping foreign key constraints for table:', tableName)
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

				// Undistribute the table
				console.log(`Removing distribution for table: ${tableName}`)
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
