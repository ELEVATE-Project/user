'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			await queryInterface.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS m_users`, {
				transaction: transaction,
			})

			// Check if Citus is enabled
			const [citusEnabled] = await queryInterface.sequelize.query(
				"SELECT COUNT(*) FROM pg_extension WHERE extname = 'citus';"
			)

			// Check if organizations table is distributed
			let orgsDistributed = false

			if (citusEnabled[0].count > 0) {
				// Check if organizations table is distributed
				const [orgResults] = await queryInterface.sequelize.query(
					`SELECT count(*) AS count
					FROM pg_dist_partition 
					WHERE logicalrelid = 'public.organizations'::regclass`,
					{ transaction: transaction }
				)

				if (orgResults.length > 0 && parseInt(orgResults[0].count) > 0) {
					orgsDistributed = true

					// Undistribute the table
					await queryInterface.sequelize.query(
						`SELECT undistribute_table($$public.organizations$$, cascade_via_foreign_keys => true)`,
						{ transaction: transaction }
					)
				}
			}

			// Step 1: Create tenant_code column in users and organizations tables
			await queryInterface.addColumn(
				'users',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			await queryInterface.addColumn(
				'organizations',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			await queryInterface.addColumn(
				'organizations',
				'meta',
				{
					type: Sequelize.JSON,
					allowNull: true,
				},
				{ transaction }
			)

			// Populate tenant_code in organizations
			// Assuming we'll use a default tenant code for existing data
			// You might want to adjust this based on your data
			await queryInterface.sequelize.query(
				`
        UPDATE organizations 
        SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
        WHERE tenant_code IS NULL
      `,
				{ transaction }
			)

			// Propagate tenant_code from organizations to users
			await queryInterface.sequelize.query(
				`
        UPDATE users u
        SET tenant_code = (
          SELECT o.tenant_code
          FROM organizations o
          WHERE o.id = u.organization_id
        )
      `,
				{ transaction }
			)

			// Step 2: Add phone, phone_code, and username columns to users table
			await queryInterface.addColumn(
				'users',
				'phone',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			await queryInterface.addColumn(
				'users',
				'phone_code',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			await queryInterface.addColumn(
				'users',
				'username',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Create unique constraints for new columns within a tenant
			await queryInterface.addConstraint('users', {
				fields: ['phone', 'tenant_code'],
				type: 'unique',
				name: 'unique_phone_per_tenant',
				transaction,
			})

			await queryInterface.addConstraint('users', {
				fields: ['username', 'tenant_code'],
				type: 'unique',
				name: 'unique_username_per_tenant',
				transaction,
			})

			// Step 3: Move user-organization relationships to user_organizations table
			await queryInterface.sequelize.query(
				`
        INSERT INTO user_organizations (user_id, organization_code, tenant_code, created_at, updated_at)
        SELECT 
          u.id as user_id, 
          o.code as organization_code, 
          u.tenant_code,
          NOW() as created_at, 
          NOW() as updated_at
        FROM users u
        JOIN organizations o ON u.organization_id = o.id
        WHERE u.organization_id IS NOT NULL AND u.tenant_code IS NOT NULL AND u.deleted_at IS NULL
        `,
				{ transaction }
			)

			await queryInterface.sequelize.query(
				`
				INSERT INTO user_organization_roles (
				  tenant_code, user_id, organization_code, role_id, created_at, updated_at
				)
				SELECT
				  u.tenant_code,
				  u.id AS user_id,
				  o.code AS organization_code,
				  role_id,
				  NOW() AS created_at,
				  NOW() AS updated_at
				FROM users u
				JOIN organizations o ON u.organization_id = o.id
				CROSS JOIN LATERAL unnest(u.roles) AS role_id
				WHERE u.organization_id IS NOT NULL
				  AND u.tenant_code IS NOT NULL
				  AND u.roles IS NOT NULL
				  AND u.deleted_at IS NULL
				  AND role_id IS NOT NULL
				`,
				{ transaction }
			)

			// Step 4: Remove foreign key constraint between users and organizations
			await queryInterface.removeConstraint('users', 'fk_user_organization', { transaction })

			// Step 5: Update the primary keys to include tenant_code
			// First, remove the existing primary key from users
			await queryInterface.sequelize.query(
				`
        ALTER TABLE users DROP CONSTRAINT users_pkey
      `,
				{ transaction }
			)

			// Create new primary key including tenant_code
			await queryInterface.sequelize.query(
				`
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id, tenant_code)
      `,
				{ transaction }
			)

			// Step 6: Update the primary keys to include tenant_code
			// First, remove the existing primary key from users
			await queryInterface.sequelize.query(
				`
        ALTER TABLE organizations DROP CONSTRAINT organizations_pkey
      `,
				{ transaction }
			)

			// Create new primary key including tenant_code
			await queryInterface.sequelize.query(
				`
        ALTER TABLE organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id, tenant_code)
      `,
				{ transaction }
			)
			await queryInterface.addConstraint('organizations', {
				fields: ['code', 'tenant_code'],
				type: 'unique',
				name: 'unique_org_code_per_tenant',
				transaction,
			})
			// Step 6: Remove the organization_id column from users
			await queryInterface.removeColumn('users', 'organization_id', { transaction })

			// Step 7: Set NOT NULL constraint on tenant_code
			await queryInterface.changeColumn(
				'users',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: false,
				},
				{ transaction }
			)

			await queryInterface.changeColumn(
				'organizations',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: false,
				},
				{ transaction }
			)

			// Redistribute tables using Citus if they were distributed before
			if (citusEnabled[0].count > 0 && orgsDistributed) {
				// Distribute organizations table with tenant_code
				await queryInterface.sequelize.query(
					`SELECT create_distributed_table('organizations', 'tenant_code')`,
					{ transaction }
				)
				await queryInterface.sequelize.query(`SELECT create_distributed_table('tenants', 'code')`, {
					transaction,
				})
				// Since organizations was distributed, also distribute users
				await queryInterface.sequelize.query(`SELECT create_distributed_table('users', 'tenant_code')`, {
					transaction,
				})

				// Also distribute user_organizations for consistency
				await queryInterface.sequelize.query(
					`SELECT create_distributed_table('user_organizations', 'tenant_code')`,
					{ transaction }
				)
			}

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Check if Citus is enabled
			const [citusEnabled] = await queryInterface.sequelize.query(
				"SELECT COUNT(*) FROM pg_extension WHERE extname = 'citus';"
			)

			// Check if organizations table is distributed
			let orgsDistributed = false

			if (citusEnabled[0].count > 0) {
				// Check if organizations table is distributed
				const [orgResults] = await queryInterface.sequelize.query(
					`SELECT count(*) AS count
					FROM pg_dist_partition 
					WHERE logicalrelid = 'public.organizations'::regclass`,
					{ transaction: transaction }
				)

				if (orgResults.length > 0 && parseInt(orgResults[0].count) > 0) {
					orgsDistributed = true

					// Undistribute tables with cascade
					await queryInterface.sequelize.query(
						`SELECT undistribute_table($public.organizations$, cascade_via_foreign_keys => true)`,
						{ transaction: transaction }
					)
				}
			}

			// Restore organization_id column in users
			await queryInterface.addColumn(
				'users',
				'organization_id',
				{
					type: Sequelize.INTEGER,
					allowNull: true,
				},
				{ transaction }
			)

			// Populate organization_id from user_organizations
			await queryInterface.sequelize.query(
				`
        UPDATE users u
        SET organization_id = (
          SELECT uo.organization_code
          FROM user_organizations uo
          WHERE uo.user_id = u.id AND uo.tenant_code = u.tenant_code
          LIMIT 1
        )
      `,
				{ transaction }
			)

			// Remove the unique constraints
			await queryInterface.removeConstraint('users', 'unique_phone_per_tenant', { transaction })
			await queryInterface.removeConstraint('users', 'unique_username_per_tenant', { transaction })

			// Remove the tenant_code, phone, phone_code, and username columns
			await queryInterface.removeColumn('users', 'phone', { transaction })
			await queryInterface.removeColumn('users', 'phone_code', { transaction })
			await queryInterface.removeColumn('users', 'username', { transaction })

			// Reset primary key on users table (remove tenant_code)
			await queryInterface.sequelize.query(
				`
        ALTER TABLE users DROP CONSTRAINT users_pkey
      `,
				{ transaction }
			)

			await queryInterface.sequelize.query(
				`
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id)
      `,
				{ transaction }
			)

			// Re-add the foreign key constraint
			await queryInterface.addConstraint('users', {
				fields: ['organization_id'],
				type: 'foreign key',
				name: 'fk_user_organization',
				references: {
					table: 'organizations',
					field: 'id',
				},
				onDelete: 'CASCADE',
				transaction,
			})

			// Remove tenant_code from organizations
			await queryInterface.removeColumn('organizations', 'tenant_code', { transaction })

			// Remove tenant_code from users
			await queryInterface.removeColumn('users', 'tenant_code', { transaction })

			// Redistribute tables if they were distributed before
			if (citusEnabled[0].count > 0 && orgsDistributed) {
				// Distribute organizations table with id (assuming this was the original distribution column)
				await queryInterface.sequelize.query(`SELECT create_distributed_table('organizations', 'id')`, {
					transaction,
				})

				// Since organizations was distributed, also distribute users with id
				await queryInterface.sequelize.query(`SELECT create_distributed_table('users', 'id')`, { transaction })

				// Check if user_organizations table exists and distribute if it does
				const [tableCheck] = await queryInterface.sequelize.query(
					`SELECT to_regclass('public.user_organizations') IS NOT NULL as exists`,
					{ transaction }
				)

				if (tableCheck[0].exists) {
					await queryInterface.sequelize.query(
						`SELECT create_distributed_table('user_organizations', 'user_id')`,
						{ transaction }
					)
				}
			}

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
}
