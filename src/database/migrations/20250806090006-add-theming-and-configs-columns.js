'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('organizations', 'theming', {
			type: Sequelize.JSON,
			allowNull: true,
		})

		await queryInterface.addColumn('users', 'configs', {
			type: Sequelize.JSONB,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('organizations', 'theming')
		await queryInterface.removeColumn('users', 'configs')
	},
}
