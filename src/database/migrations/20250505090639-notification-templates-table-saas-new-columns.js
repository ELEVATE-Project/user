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

		if (isDistributed) {
			try {
				// Drop foreign keys

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

				await queryInterface.sequelize.query(`
                    SELECT undistribute_table('${queryInterface.quoteIdentifier(tableName)}');
                `)
			} catch (error) {
				console.error('Error in undistribution:', error.message)
				throw error
			}
		}

		// Add tenant_code column as nullable
		await queryInterface.addColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// Set default value for existing records
		await queryInterface.sequelize.query(`
            UPDATE ${tableName} SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
        `)

		await queryInterface.changeColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: false,
		})
		// Drop existing primary key
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

		// Add composite primary key
		try {
			await queryInterface.sequelize.query(`
        ALTER TABLE "${tableName}" ADD PRIMARY KEY ("tenant_code", "id");
    `)
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
