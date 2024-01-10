'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('session_attendees', 'type', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'ENROLLED',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('session_attendees', 'type')
	},
}
