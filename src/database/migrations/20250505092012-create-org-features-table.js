'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('organization_features', {
			organization_code: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			feature_code: {
				type: Sequelize.STRING,
				allowNull: false,
				references: {
					model: 'features',
					key: 'code',
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
			translations: {
				type: DataTypes.JSON,
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
			fields: ['tenant_code', 'organization_code', 'feature_code'],
			type: 'primary key',
			name: 'organization_features_pkey',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('organization_features')
	},
}
