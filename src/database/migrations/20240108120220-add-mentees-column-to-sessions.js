'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('sessions', 'mentees', {
			type: Sequelize.ARRAY(Sequelize.INTEGER),
			allowNull: true,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('sessions', 'mentees')
	},
}
