'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('users', {
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
			email: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email_verified: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: false,
			},
			roles: {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: 'ACTIVE',
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			has_accepted_terms_and_conditions: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			gender: {
				type: Sequelize.STRING,
			},
			about: {
				type: Sequelize.STRING,
			},
			location: {
				type: Sequelize.STRING,
			},
			languages: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			preferred_language: {
				type: Sequelize.STRING,
				defaultValue: 'en',
			},
			share_link: {
				type: Sequelize.STRING,
			},
			last_logged_in_at: {
				type: Sequelize.DATE,
			},
			refresh_tokens: {
				type: Sequelize.ARRAY(Sequelize.JSONB),
			},
			image: {
				type: Sequelize.STRING,
			},
			custom_entity_text: {
				type: Sequelize.JSON,
			},
			meta: {
				type: Sequelize.JSONB,
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
		await queryInterface.dropTable('users')
	},
}
