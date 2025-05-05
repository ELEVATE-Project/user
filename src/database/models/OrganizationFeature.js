'use strict'
module.exports = (sequelize, DataTypes) => {
	const OrganizationFeature = sequelize.define(
		'OrganizationFeature',
		{
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			feature_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true,
			},
			tenant_code: {
				type: DataTypes.STRING,
				allowNull: true,
				primaryKey: true,
			},
			enabled: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			feature_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			icon: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			redirect_url: {
				type: DataTypes.STRING,
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
		},
		{
			sequelize,
			modelName: 'OrganizationFeature',
			tableName: 'organization_features',
			freezeTableName: true,
			paranoid: true,
		}
	)

	OrganizationFeature.associate = function (models) {
		OrganizationFeature.belongsTo(models.Organization, {
			foreignKey: 'organization_id',
		})
		OrganizationFeature.belongsTo(models.Feature, {
			foreignKey: 'feature_id',
		})
	}

	return OrganizationFeature
}
