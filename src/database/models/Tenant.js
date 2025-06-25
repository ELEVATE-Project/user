'use strict'
module.exports = (sequelize, DataTypes) => {
	const Tenant = sequelize.define(
		'Tenant',
		{
			code: {
				type: DataTypes.STRING(255),
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			logo: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			theming: {
				type: DataTypes.JSONB,
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
			modelName: 'Tenant',
			tableName: 'tenants',
			freezeTableName: true,
			paranoid: true,
		}
	)

	Tenant.associate = function (models) {
		Tenant.hasMany(models.Organization, {
			foreignKey: 'tenant_code',
			sourceKey: 'code',
			as: 'organizations',
		})
	}

	return Tenant
}
