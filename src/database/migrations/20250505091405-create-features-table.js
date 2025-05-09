'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('features', {
			code: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
			},
			label: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			icon: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			meta: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			created_by: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			updated_by: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('features')
	},
}
