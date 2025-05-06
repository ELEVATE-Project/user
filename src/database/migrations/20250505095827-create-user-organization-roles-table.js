'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_organization_roles', {
			tenant_code: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: 'tenants',
					key: 'code',
				},
				onDelete: 'CASCADE',
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			organization_code: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			role_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		})

		await queryInterface.addConstraint('user_organization_roles', {
			fields: ['tenant_code', 'user_id', 'organization_code', 'role_id'],
			type: 'primary key',
			name: 'user_organization_roles_pkey',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('user_organization_roles')
	},
}
