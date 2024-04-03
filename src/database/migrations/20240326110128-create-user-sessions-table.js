'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('user_sessions', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			started_at: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
			ended_at: {
				type: Sequelize.BIGINT,
				allowNull: true,
			},
			token: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			device_info: {
				type: Sequelize.JSONB,
				allowNull: true,
			},
			refresh_token: {
				type: Sequelize.TEXT,
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

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('user_sessions')
	},
}
