'use strict'
/** @type {import('sequelize-cli').Migration} */

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
				unique: true,
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
			status: {
				type: Sequelize.STRING,
				allowNull: false,
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
		await queryInterface.addIndex('permissions', {
			type: 'unique',
			fields: ['code'],
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
