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
			org_admin: DataTypes.ARRAY(DataTypes.INTEGER),
			parent_id: DataTypes.INTEGER,
			related_orgs: DataTypes.ARRAY(DataTypes.INTEGER),
			in_domain_visibility: DataTypes.STRING,
			created_by: {
				type: DataTypes.INTEGER,
			},
			updated_by: {
				type: DataTypes.INTEGER,
			},
		},
		{ sequelize, modelName: 'Organization', tableName: 'organizations', freezeTableName: true, paranoid: true }
	)
	Organization.associate = (models) => {
		Organization.hasMany(models.User, { foreignKey: 'organization_id' }, { as: 'users' })
	}
	return Organization
}
