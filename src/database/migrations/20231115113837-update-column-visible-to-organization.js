'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('user_extensions', 'visible_to_organizations', {
			type: Sequelize.ARRAY(Sequelize.INTEGER),
		})

		await queryInterface.changeColumn('mentor_extensions', 'visible_to_organizations', {
			type: Sequelize.ARRAY(Sequelize.INTEGER),
		})
		await queryInterface.changeColumn('sessions', 'visible_to_organizations', {
			type: Sequelize.ARRAY(Sequelize.INTEGER),
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('user_extensions', 'visible_to_organizations', {
			type: Sequelize.ARRAY(Sequelize.STRING),
		})
		await queryInterface.changeColumn('mentor_extensions', 'visible_to_organizations', {
			type: Sequelize.ARRAY(Sequelize.STRING),
		})
		await queryInterface.changeColumn('sessions', 'visible_to_organizations', {
			type: Sequelize.ARRAY(Sequelize.STRING),
		})
	},
}
