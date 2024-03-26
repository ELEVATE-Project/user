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
				type: Sequelize.DATE,
				allowNull: false,
			},
			ended_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			token: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			device_info: {
				type: Sequelize.JSONB,
				allowNull: true,
			},
			refresh_token: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('user_sessions')
	},
}
