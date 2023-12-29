'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('forms', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			sub_type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			data: Sequelize.JSON,
			version: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
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
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('forms')
	},
}
