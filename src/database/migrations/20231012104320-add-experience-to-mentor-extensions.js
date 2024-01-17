'use strict'

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn('mentor_extensions', 'experience', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.removeColumn('mentor_extensions', 'experience')
	},
}
