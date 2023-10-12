'use strict'

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn('user_extensions', 'experience', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.removeColumn('user_extensions', 'experience')
	},
}
