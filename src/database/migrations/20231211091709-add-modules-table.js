'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('modules', {
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

		await queryInterface.addIndex('modules', ['code'], {
			unique: true,
			name: 'code_unique',
			where: {
				deleted_at: null,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('modules')
	},
}
