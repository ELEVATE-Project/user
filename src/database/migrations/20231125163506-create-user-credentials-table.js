'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('users_credentials', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
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

		await queryInterface.addIndex('users_credentials', ['email'], {
			unique: true,
			where: {
				deleted_at: null,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('users_credentials')
	},
}
