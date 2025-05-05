'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_organizations', {
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			tenant_code: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: 'tenants',
					key: 'code',
				},
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
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

		// Add composite primary key after table creation
		await queryInterface.addConstraint('user_organizations', {
			fields: ['tenant_code', 'user_id', 'organization_id'],
			type: 'primary key',
			name: 'pk_user_organizations',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('user_organizations')
	},
}
