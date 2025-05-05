'use strict'
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('tenants', {
			code: {
				type: Sequelize.STRING(255),
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			logo: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			theming: {
				type: Sequelize.JSONB,
				allowNull: true,
			},
			meta: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			created_by: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			updated_by: {
				type: Sequelize.INTEGER,
				allowNull: true,
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
				allowNull: true,
			},
		})

		// Create domains table
		await queryInterface.createTable('tenant_domains', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
			},
			tenant_code: {
				type: Sequelize.STRING(255),
				allowNull: false,
				references: {
					model: 'tenants',
					key: 'code',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			domain: {
				type: Sequelize.STRING(255),
				allowNull: false,
				unique: true,
			},
			verified: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
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
				allowNull: true,
			},
		})

		// Make the primary key a combination of id and tenant_code for proper sharding
		await queryInterface.addConstraint('tenant_domains', {
			fields: ['tenant_code', 'id'],
			type: 'primary key',
			name: 'pk_tenant_domains_tenant_code_id',
		})
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('tenant_domains')
		await queryInterface.dropTable('tenants')
	},
}
