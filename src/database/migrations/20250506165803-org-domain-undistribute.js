'use strict'
const tableName = 'organization_email_domains'
module.exports = {
	up: async (queryInterface, Sequelize) => {
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
	},

	down: async (queryInterface, Sequelize) => {
		// 1. Drop composite primary key
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)

		await queryInterface.removeColumn(tableName, 'tenant_code')
	},
}
