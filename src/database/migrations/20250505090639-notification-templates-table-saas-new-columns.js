'use strict'
const tableName = 'notification_templates'
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

		// Add tenant_code column as nullable
		await queryInterface.addColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})
		console.log('TENANT CODE ADDED ')

		// Set default value for existing records
		await queryInterface.sequelize.query(`
            UPDATE ${tableName} SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
        `)

		console.log('TENANT DEFAULT ADDED ')

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

		// Add composite primary key
		try {
			console.log(`Adding composite primary key on ${tableName}`)
			await queryInterface.sequelize.query(`
        ALTER TABLE "${tableName}" ADD PRIMARY KEY ("tenant_code", "id");
    `)
			console.log('Composite primary key added successfully')
		} catch (error) {
			console.error('Error adding composite primary key:', error)
			throw error
		}

		await queryInterface.addConstraint(tableName, {
			fields: ['type', 'code', 'organization_id', 'tenant_code'],
			type: 'unique',
			name: 'unique_type_code_organization_id_tenant_code',
		})
		if (isDistributed) {
			console.log(' ----->>>>> ')
			console.log(`Redistributing table: ${tableName} on tenant_code`)
			await queryInterface.sequelize.query(`
                SELECT create_distributed_table('${tableName}', 'tenant_code');
            `)
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)

		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id", "organization_id")
    `)
		await queryInterface.removeConstraint(tableName, 'unique_type_code_organization_id_tenant_code')
		await queryInterface.removeColumn('notification_templates', 'tenant_code')
	},
}
