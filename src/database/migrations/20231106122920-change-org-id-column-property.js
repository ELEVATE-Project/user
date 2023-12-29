'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('user_extensions', 'org_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
		await queryInterface.changeColumn('mentor_extensions', 'org_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('user_extensions', 'org_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
		await queryInterface.changeColumn('mentor_extensions', 'org_id', {
			type: Sequelize.INTEGER,
		})
	},
}
