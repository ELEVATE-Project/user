'use strict'
module.exports = (sequelize, DataTypes) => {
	const UserSessions = sequelize.define(
		'UserSessions',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			started_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			ended_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			token: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			device_info: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			refresh_token: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'UserSessions',
			tableName: 'user_sessions',
			freezeTableName: true,
			paranoid: true,
		}
	)
	return UserSessions
}
