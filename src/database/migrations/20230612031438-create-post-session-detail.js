'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('post_session_details', {
			id: {
				allowNull: false,
				autoIncrement: true,
				type: Sequelize.INTEGER,
			},
			session_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			recording: {
				type: Sequelize.JSON,
			},
			recording_url: {
				type: Sequelize.STRING,
			},
			meta: {
				type: Sequelize.JSON,
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
		await queryInterface.dropTable('post_session_details')
	},
}
