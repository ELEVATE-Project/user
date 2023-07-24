'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('entity_types', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			value: {
				type: Sequelize.STRING,
			},
			label: {
				type: Sequelize.STRING,
			},
			status: {
				type: Sequelize.STRING,
			},
			type: {
				type: Sequelize.STRING,
			},
			created_b: {
				type: Sequelize.INTEGER,
			},
			updated_by: {
				type: Sequelize.INTEGER,
			},
			allow_filtering: {
				type: Sequelize.BOOLEAN,
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
		await queryInterface.dropTable('entity_types')
	},
}
