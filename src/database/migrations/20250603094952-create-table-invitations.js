'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('invitations', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			file_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			editable_fields: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
				defaultValue: null,
			},
			valid_till: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			created_by: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			organization_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			tenant_code: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			deleted_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('invitations')
	},
}
