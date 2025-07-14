'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			const tables = ['entities', 'entity_types', 'role_permission_mapping']
			const schema = 'public'

			for (const table of tables) {
				// Check for 'created_by'
				const [createdByCol] = await queryInterface.sequelize.query(
					`SELECT 1 FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}' AND column_name = 'created_by'`,
					{ transaction }
				)

				if (createdByCol.length) {
					await queryInterface.sequelize.query(
						`UPDATE "${table}" SET created_by = NULL WHERE created_by = 0`,
						{ transaction }
					)
				}

				// Check for 'updated_by'
				const [updatedByCol] = await queryInterface.sequelize.query(
					`SELECT 1 FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${table}' AND column_name = 'updated_by'`,
					{ transaction }
				)

				if (updatedByCol.length) {
					await queryInterface.sequelize.query(
						`UPDATE "${table}" SET updated_by = NULL WHERE updated_by = 0`,
						{ transaction }
					)
				}
			}

			await transaction.commit()
		} catch (err) {
			await transaction.rollback()
			throw err
		}
	},

	down: async () => {
		// No safe rollback possible
		return Promise.resolve()
	},
}
