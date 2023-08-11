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
				allowNull: false,
			},
			label: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: 'ACTIVE',
			},
			data_type: {
				type: Sequelize.STRING, //numeric, alphaNumeric etc
			},
			created_by: {
				type: Sequelize.INTEGER,
			},
			updated_by: {
				type: Sequelize.INTEGER,
			},
			allow_filtering: {
				type: Sequelize.BOOLEAN,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})

		// Add an index for the 'value' column
		await queryInterface.addIndex('entity_types', ['value'], {
			unique: true,
			name: 'unique_value',
			where: {
				deleted_at: null,
			},
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('entity_types')
	},
}
