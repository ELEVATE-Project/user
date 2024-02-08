'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('role_permission_mapping', {
			role_title: {
				allowNull: false,
				type: Sequelize.STRING,
				primaryKey: true,
			},
			permission_id: {
				allowNull: false,
				type: Sequelize.INTEGER,
				primaryKey: true,
			},
			module: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			request_type: {
				allowNull: false,
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			api_path: {
				allowNull: false,
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
			created_by: {
				allowNull: false,
				type: Sequelize.INTEGER,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('role_permission_mapping')
	},
}
