'use strict'
const tableName = 'entities'
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
		// drop existing PK from entities
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)
		// add new PK to the entities table
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id" , "tenant_code")
    `)
		// add unique constrain
		await queryInterface.addConstraint(tableName, {
			fields: ['value', 'entity_type_id', 'tenant_code'],
			type: 'unique',
			name: 'unique_value_entity_type_id_tenant_code',
		})

		await queryInterface.removeConstraint(tableName, 'unique_entities_value')
		// Redistribute table if it was distributed
		if (isDistributed) {
			console.log(' ----->>>>> ')
			console.log(`Redistributing table: ${tableName} on tenant_code`)
			await queryInterface.sequelize.query(`
                SELECT create_distributed_table('${tableName}', 'tenant_code');
            `)
		}
	},

	down: async (queryInterface, Sequelize) => {
		// drop existing PK from entities
		await queryInterface.sequelize.query(`
        ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
      `)
		await queryInterface.removeConstraint(tableName, 'unique_value_entity_type_id_tenant_code')
		await queryInterface.removeColumn(tableName, 'tenant_code')
	},
}
