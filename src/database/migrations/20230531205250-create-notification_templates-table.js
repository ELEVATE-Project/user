'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('notification_templates', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			type: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			code: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			subject: { type: Sequelize.STRING },
			body: {
				type: Sequelize.TEXT,
			},
			status: {
				type: Sequelize.STRING,
			},
			email_header: {
				type: Sequelize.STRING,
			},
			email_footer: {
				type: Sequelize.STRING,
			},
			created_by: {
				type: Sequelize.STRING,
			},
			updated_by: {
				type: Sequelize.STRING,
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
		await queryInterface.dropTable('notification_templates')
	},
}
