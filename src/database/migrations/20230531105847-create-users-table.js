'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('users', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			email_verified: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			gender: {
				type: Sequelize.STRING,
			},
			location: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			about: {
				type: Sequelize.STRING,
			},
			share_link: {
				type: Sequelize.STRING,
			},
			status: {
				type: Sequelize.STRING,
			},
			image: {
				type: Sequelize.STRING,
			},
			last_logged_in_at: {
				type: Sequelize.DATE,
			},
			has_accepted_terms_and_conditions: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			refresh_token: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			languages: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			preferred_language: {
				type: Sequelize.STRING,
				defaultValue: 'en',
			},
			organization_id: {
				type: Sequelize.INTEGER,
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
		await queryInterface.dropTable('users')
	},
}
