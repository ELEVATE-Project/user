'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if Citus extension is installed
		const citusCheck = await queryInterface.sequelize.query(
			`SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'citus'
      ) AS has_citus;`,
			{ type: Sequelize.QueryTypes.SELECT }
		)

		const hasCitus = citusCheck[0].has_citus

		if (!hasCitus) {
			console.log('Citus extension is not installed. Skipping table distribution.')
			return
		}

		console.log('Citus extension is installed. Checking for distributed tables...')

		// Check if at least one table is already distributed
		const distributedTableCheck = await queryInterface.sequelize.query(
			`SELECT COUNT(*) AS count FROM pg_dist_partition;`,
			{ type: Sequelize.QueryTypes.SELECT }
		)

		const hasDistributedTables = parseInt(distributedTableCheck[0].count) > 0

		if (!hasDistributedTables) {
			console.log('No tables are currently distributed. Skipping further distribution.')
			return
		}

		console.log('Found existing distributed tables. Proceeding with migration...')

		// Create reference table for 'features'
		try {
			await queryInterface.sequelize.query(`SELECT create_reference_table('features');`)
			await queryInterface.sequelize.query(
				`SELECT create_distributed_table('organization_features','tenant_code');`
			)
			console.log('Successfully created reference table: features')
		} catch (error) {
			// If table is already distributed or doesn't exist, log and continue
			console.log(`Note regarding features table: ${error.message}`)
		}

		// List of tables to distribute with their distribution columns
		const tablesToDistribute = [
			{ name: 'tenants', column: 'code' },
			{ name: 'tenant_domains', column: 'domain' },
			{ name: 'user_organizations', column: 'tenant_code' },
			{ name: 'user_organization_roles', column: 'tenant_code' },
			{ name: 'organization_features', column: 'tenant_code' },
		]

		// Distribute each table
		for (const table of tablesToDistribute) {
			try {
				// Check if table is already distributed
				const tableCheck = await queryInterface.sequelize.query(
					`SELECT EXISTS(
            SELECT 1 FROM pg_dist_partition 
            WHERE logicalrelid = '${table.name}'::regclass
          ) AS is_distributed;`,
					{ type: Sequelize.QueryTypes.SELECT }
				)

				if (tableCheck[0].is_distributed) {
					console.log(`Table ${table.name} is already distributed. Skipping.`)
					continue
				}

				await queryInterface.sequelize.query(
					`SELECT create_distributed_table('${table.name}', '${table.column}');`
				)
				console.log(`Successfully distributed table: ${table.name} by column: ${table.column}`)
			} catch (error) {
				console.log(`Error distributing table ${table.name}: ${error.message}`)
			}
		}
	},

	down: async (queryInterface, Sequelize) => {
		// Note: Citus doesn't provide a simple way to "undistribute" tables
		// This would typically require recreating tables as local tables
		// For safety, the down migration is intentionally left as a no-op
		console.log(`Citus doesn't provide a simple way to "undistribute" tables
		This would typically require recreating tables as local tables
		For safety, the down migration is intentionally left as a no-op')`)
	},
}
