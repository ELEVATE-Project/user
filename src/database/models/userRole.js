'use strict'
const common = require('@constants/common')
module.exports = (sequelize, DataTypes) => {
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
			user_type: {
				type: DataTypes.INTEGER, //0 - non system user , 1 - system user
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: common.ACTIVE_STATUS,
			},
			visiblity: {
				type: DataTypes.STRING,
				defaultValue: common.DEFAULT_ORG_VISIBILITY,
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{ sequelize, modelName: 'UserRole', tableName: 'user_roles', freezeTableName: true, paranoid: true }
	)

	UserRole.associate = (models) => {
		UserRole.hasMany(models.User, { foreignKey: 'id', as: 'user_role_array' })
	}

	return UserRole
}
