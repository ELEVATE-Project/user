'use strict'
module.exports = (sequelize, DataTypes) => {
	const TenantDomain = sequelize.define(
		'TenantDomain',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			tenant_code: {
				type: DataTypes.STRING(255),
				allowNull: false,
				primaryKey: true,
			},
			domain: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: true,
			},
			verified: {
				type: DataTypes.BOOLEAN,
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
			modelName: 'TenantDomain',
			tableName: 'tenant_domains',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return TenantDomain
}
