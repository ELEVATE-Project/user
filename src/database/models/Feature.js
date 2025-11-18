'use strict'
module.exports = (sequelize, DataTypes) => {
	const Feature = sequelize.define(
		'Feature',
		{
			code: {
				type: DataTypes.STRING(255),
				allowNull: false,
				primaryKey: true,
			},
			label: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			icon: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			meta: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			created_by: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			updated_by: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			deleted_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			display_order: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'Feature',
			tableName: 'features',
			freezeTableName: true,
			paranoid: true,
		}
	)
	Feature.associate = (models) => {
		Feature.hasMany(models.OrganizationFeature, {
			foreignKey: 'feature_code',
			as: 'organization_features',
		})
		Feature.hasMany(models.FeatureRoleMapping, {
			foreignKey: 'feature_code',
			sourceKey: 'code',
			as: 'featureRoleMappings',
		})
	}

	return Feature
}
