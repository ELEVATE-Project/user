'use strict'
module.exports = (sequelize, DataTypes) => {
	const Organization = sequelize.define(
		'Organization',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'ACTIVE',
			},
			org_admin: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			parent_id: {
				type: DataTypes.INTEGER,
			},
			related_orgs: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			in_domain_visibility: {
				type: DataTypes.STRING,
			},
			tenant_code: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
			updated_by: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: 'Organization',
			tableName: 'organizations',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return Organization
}
