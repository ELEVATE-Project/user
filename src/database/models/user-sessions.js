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
				primaryKey: true,
			},
			started_at: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			ended_at: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			token: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			device_info: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			refresh_token: {
				type: DataTypes.TEXT,
				allowNull: true,
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
