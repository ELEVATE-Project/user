'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('session_ownerships', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
			},
			mentor_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			session_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('session_ownerships')
	},
}
