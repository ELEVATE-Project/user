'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('file_uploads', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			input_path: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: 'UPLOADED',
				allowNull: false,
			},
			type: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			output_path: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			created_by: {
				type: Sequelize.INTEGER,
			},
			updated_by: {
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

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('file_uploads')
	},
}
