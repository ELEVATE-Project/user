'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('organization_features', {
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'organizations',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			feature_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'features',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			enabled: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			feature_name: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			icon: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			redirect_url: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			tenant_code: {
				type: Sequelize.STRING,
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

		await queryInterface.addConstraint('organization_features', {
			fields: ['tenant_code', 'organization_id', 'feature_id'],
			type: 'primary key',
			name: 'organization_features_pkey',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('organization_features')
	},
}
