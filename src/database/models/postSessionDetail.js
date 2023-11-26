'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	const PostSessionDetail = sequelize.define(
		'PostSessionDetail',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				type: DataTypes.INTEGER,
			},
			session_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			recording: {
				type: DataTypes.JSON,
			},
			recording_url: {
				type: DataTypes.STRING,
			},
			meta: {
				type: DataTypes.JSON,
			},
		},
		{
			sequelize,
			modelName: 'PostSessionDetail',
			tableName: 'post_session_details',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return PostSessionDetail
}
