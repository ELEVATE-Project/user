'use strict'
module.exports = (sequelize, DataTypes) => {
	const organizationCode = sequelize.define(
		'organizationCode',
		{
			code: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			tenant_code: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: process.env.DEFAULT_TENANT_CODE,
			},
		},
		{
			sequelize,
			modelName: 'organizationCode',
			tableName: 'organization_codes',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return organizationCode
}
