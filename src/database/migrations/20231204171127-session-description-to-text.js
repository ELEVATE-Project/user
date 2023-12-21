'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('sessions', 'description', {
			type: Sequelize.TEXT,
			allowNull: true,
		})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.changeColumn('sessions', 'description', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
}
