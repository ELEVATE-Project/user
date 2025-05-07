'use strict'
const tableName = 'user_roles'

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
			isCitusEnabled = false
		}

		// Check if the table is distributed (only if Citus is enabled)
		let isDistributed = false
		if (isCitusEnabled) {
			try {
				const distributionCheckResult = await queryInterface.sequelize.query(`
          SELECT 1 FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass;
        `)
				isDistributed = distributionCheckResult[0].length > 0
			} catch (error) {
				console.error('Error checking table distribution:', error.message)
				isDistributed = false
			}
		}

		// Check for and drop primary key or unique constraint (to resolve the index error)
		try {
			const [constraintResult] = await queryInterface.sequelize.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = '${tableName}'::regclass AND contype IN ('p', 'u');
      `)
			for (const constraint of constraintResult) {
				await queryInterface.sequelize.query(`
          ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraint.conname}";
        `)
			}
			if (constraintResult.length === 0) {
			}
		} catch (error) {
			console.error('Error checking or dropping constraints:', error.message)
			throw error
		}

		// 1. Add tenant_code as nullable
		await queryInterface.addColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// 2. Set value for existing records
		await queryInterface.sequelize.query(`
      UPDATE "${tableName}" SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}';
    `)

		// Set default value for existing records
		await queryInterface.sequelize.query(`
	UPDATE ${tableName} SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
`)

		await queryInterface.changeColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: false,
		})

		if (isCitusEnabled && isDistributed) {
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

		// Add new composite primary key
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("tenant_code", "id");
    `)

		if (isCitusEnabled && isDistributed) {
			await queryInterface.sequelize.query(`
        SELECT create_distributed_table('${tableName}', 'tenant_code');
      `)
		}
	},

	down: async (queryInterface, Sequelize) => {
		// 1. Drop composite primary key
		try {
			const [primaryKeyResult] = await queryInterface.sequelize.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = '${tableName}'::regclass AND contype = 'p';
      `)
			if (primaryKeyResult.length > 0) {
				const primaryKeyName = primaryKeyResult[0].conname

				await queryInterface.sequelize.query(`
          ALTER TABLE "${tableName}" DROP CONSTRAINT "${primaryKeyName}";
        `)
			}
		} catch (error) {
			console.error('Error dropping primary key in down migration:', error.message)
			throw error
		}

		// 2. Remove tenant_code column
		await queryInterface.removeColumn(tableName, 'tenant_code')

		// 3. Restore original primary key (e.g., on id column)
		try {
			await queryInterface.sequelize.query(`
        ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id");
      `)
		} catch (error) {
			console.error('Error restoring original primary key:', error.message)
			throw error
		}
	},
}
