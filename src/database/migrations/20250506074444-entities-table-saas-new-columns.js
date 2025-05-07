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

		// Add unique index (without partial condition)
		try {
			await queryInterface.sequelize.query(`
				CREATE UNIQUE INDEX unique_value_org_id_tenant_code
				ON "${tableName}" (tenant_code, organization_id, value)
				WHERE deleted_at IS NULL;
			`)
		} catch (error) {
			console.error('Failed to add unique index:', error)
			throw error
		}

		// add unique constrain
		await queryInterface.addConstraint(tableName, {
			fields: ['value', 'entity_type_id', 'tenant_code'],
			type: 'unique',
			name: 'unique_value_entity_type_id_tenant_code',
		})

		await queryInterface.removeConstraint(tableName, 'unique_entities_value')
		// Redistribute table if it was distributed
		if (isDistributed) {
			await queryInterface.sequelize.query(`
                SELECT create_distributed_table('${tableName}', 'tenant_code');
            `)
		}
	},

	down: async (queryInterface, Sequelize) => {
		// Drop composite primary key
		await queryInterface.sequelize.query(`
            ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
        `)

		// Re-add original primary key
		await queryInterface.sequelize.query(`
            ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id", "organization_id")
        `)

		// Remove unique index
		await queryInterface.removeIndex(tableName, 'unique_value_org_id_tenant_code')

		// Remove tenant_code column
		await queryInterface.removeColumn(tableName, 'tenant_code')
	},
}
