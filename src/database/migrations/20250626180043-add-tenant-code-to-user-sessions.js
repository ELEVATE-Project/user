'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			// 1. Add tenant_code column (initially nullable)
			await queryInterface.addColumn(
				'user_sessions',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// 2. Backfill tenant_code from users table
			await queryInterface.sequelize.query(
				`
        UPDATE user_sessions us
        SET tenant_code = u.tenant_code
        FROM users u
        WHERE us.user_id = u.id
        `,
				{ transaction }
			)

			// 3. Set NOT NULL if needed
			await queryInterface.changeColumn(
				'user_sessions',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: false,
				},
				{ transaction }
			)
			//B
			// 1. Drop existing PK
			await queryInterface.sequelize.query(
				`ALTER TABLE public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;`,
				{ transaction }
			)

			// 2. Add new PK with tenant_code
			await queryInterface.sequelize.query(
				`ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id, user_id, tenant_code);`,
				{ transaction }
			)

			// 3. Check if Citus is enabled
			const [citusEnabled] = await queryInterface.sequelize.query(
				`SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'citus') AS enabled;`,
				{ transaction }
			)

			const isCitusEnabled = citusEnabled[0]?.enabled === true

			if (isCitusEnabled) {
				// 4. Distribute table if not already distributed
				await queryInterface.sequelize.query(
					`SELECT create_distributed_table('public.user_sessions', 'tenant_code');`,
					{ transaction }
				)
			}

			await transaction.commit()
		} catch (err) {
			await transaction.rollback()
			throw err
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			await queryInterface.removeColumn('user_sessions', 'tenant_code', { transaction })
			await transaction.commit()
		} catch (err) {
			await transaction.rollback()
			throw err
		}
	},
}
