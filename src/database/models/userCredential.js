'use strict'
module.exports = (sequelize, DataTypes) => {
	const UserCredential = sequelize.define(
		'UserCredential',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				primaryKey: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			organization_id: DataTypes.INTEGER,
			user_id: { type: DataTypes.INTEGER, allowNull: true },
			organization_user_invite_id: { type: DataTypes.INTEGER, allowNull: true },
			meta: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
		},

		{
			sequelize,
			modelName: 'UserCredential',
			tableName: 'users_credentials',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return UserCredential
}
