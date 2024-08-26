'use strict'
const common = require('@constants/common')
module.exports = (sequelize, DataTypes) => {
	const defaultOrgId = sequelize.options.defaultOrgId
	const UserRole = sequelize.define(
		'UserRole',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			label: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			user_type: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: common.ACTIVE_STATUS,
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			visibility: {
				type: DataTypes.STRING,
				defaultValue: 'PUBLIC',
			},
		},
		{ sequelize, modelName: 'UserRole', tableName: 'user_roles', freezeTableName: true, paranoid: true }
	)

	UserRole.associate = (models) => {
		UserRole.hasMany(models.User, { foreignKey: 'id', as: 'user_role_array' })
	}

	return UserRole
}
