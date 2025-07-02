'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('role_permission_mapping', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('role_permission_mapping', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},
}
