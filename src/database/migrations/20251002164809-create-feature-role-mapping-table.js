'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('feature_role_mapping', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
			},
			feature_code: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			role_title: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			organization_code: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			tenant_code: {
				type: Sequelize.STRING,
				allowNull: false,
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
				allowNull: true,
				type: Sequelize.DATE,
			},
		})

		// Add composite primary key
		await queryInterface.addConstraint('feature_role_mapping', {
			fields: ['id', 'tenant_code'],
			type: 'primary key',
			name: 'pk_feature_role_mapping',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('feature_role_mapping')
	},
}
