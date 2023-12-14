'use strict'

/** @type {import('sequelize-cli').Migration} */
const common = require('@constants/common')
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('permissions', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			code: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			module: {
				allowNull: false,
				type: Sequelize.STRING,
			},
			actions: {
				allowNull: false,
				type: Sequelize.ENUM('ALL', 'READ', 'WRITE', 'UPDATE', 'DELETE'),
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: common.ACTIVE_STATUS,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		})
		await queryInterface.addIndex('permissions', ['code'], {
			unique: true,
			name: 'unique_code',
			where: {
				deleted_at: null,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('permissions')
	},
}
