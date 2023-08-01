'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('questions', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			question: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			options: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
			},
			type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			no_of_stars: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			status: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			category: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			rendering_data: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			meta: {
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
		await queryInterface.dropTable('questions')
	},
}
