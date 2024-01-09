'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('sessions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})

		await queryInterface.changeColumn('sessions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})

		await queryInterface.changeColumn('sessions', 'mentor_name', {
			type: Sequelize.STRING,
			allowNull: false,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('sessions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.changeColumn('sessions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.changeColumn('sessions', 'mentor_name', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
}
