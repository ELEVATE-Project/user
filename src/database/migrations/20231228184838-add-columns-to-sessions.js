'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('sessions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('sessions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('sessions', 'type', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'PUBLIC',
		})
		await queryInterface.addColumn('sessions', 'mentor_name', {
			type: Sequelize.STRING,
			allowNull: true,
		})
		// Update existing null values
		await queryInterface.bulkUpdate(
			'sessions',
			{
				created_by: Sequelize.literal('mentor_id'),
				updated_by: Sequelize.literal('mentor_id'),
			},
			{
				created_by: null,
				updated_by: null,
			}
		)

		//Modify columns to disallow null

		await queryInterface.changeColumn('sessions', 'created_by', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
		await queryInterface.changeColumn('sessions', 'updated_by', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('sessions', 'created_by')
		await queryInterface.removeColumn('sessions', 'updated_by')
		await queryInterface.removeColumn('sessions', 'type')
		await queryInterface.removeColumn('sessions', 'mentor_name')
	},
}
