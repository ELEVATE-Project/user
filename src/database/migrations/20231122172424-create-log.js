'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			await queryInterface.createTable('logs', {
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: Sequelize.INTEGER,
				},
				email: {
					type: Sequelize.ARRAY(Sequelize.TEXT),
				},
				type: {
					type: Sequelize.STRING,
					defaultValue: 'EMAIL',
				},
				status: {
					type: Sequelize.ENUM('SENT', 'FAILED'),
					allowNull: false,
					defaultValue: 'SENT',
				},
				error: {
					type: Sequelize.JSON,
				},
				response_code: {
					type: Sequelize.INTEGER,
				},
				meta: {
					type: Sequelize.JSONB,
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
		} catch (error) {
			console.log(error)
		}
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('logs')
	},
}
