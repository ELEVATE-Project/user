'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('feedbacks', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			session_id: {
				type: Sequelize.INTEGER,
			},
			question_id: {
				type: Sequelize.INTEGER,
			},
			response: {
				type: Sequelize.STRING,
			},
			meta: {
				type: Sequelize.JSON,
			},
			user_id: {
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
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('feedbacks')
	},
}
