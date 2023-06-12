'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('session_attendees', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			mentee_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			session_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			time_zone: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			joined_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			left_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			is_feedback_skipped: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			meeting_info: {
				type: Sequelize.JSON,
				allowNull: true,
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
		await queryInterface.dropTable('session_attendees')
	},
}
