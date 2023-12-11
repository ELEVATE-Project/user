'use strict'
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
				defaultValue: 'ACTIVE',
			},
			visiblity: {
				type: DataTypes.STRING,
				defaultValue: 'PUBLIC',
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{ sequelize, modelName: 'UserRole', tableName: 'user_roles', freezeTableName: true, paranoid: true }
	)

	UserRole.associate = (models) => {
		UserRole.hasMany(models.User, { foreignKey: 'id', as: 'user_role_array' })
	}

	return UserRole
}
