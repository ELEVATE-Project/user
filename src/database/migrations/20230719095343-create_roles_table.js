'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('user_roles', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			user_type: {
				type: Sequelize.INTEGER, //0 - non system user , 1 - system user
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: 'ACTIVE',
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
		await queryInterface.dropTable('user_roles')
	},
}
