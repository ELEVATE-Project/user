'use strict'
module.exports = (sequelize, DataTypes) => {
	const NotificationTemplate = sequelize.define(
		'NotificationTemplate',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			code: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			subject: {
				type: DataTypes.STRING,
			},
			body: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email_header: DataTypes.STRING,
			email_footer: DataTypes.STRING,
			created_by: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			updated_by: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'NotificationTemplate',
			tableName: 'notification_templates',
			freezeTableName: true,
			paranoid: true,
		}
	)
	return NotificationTemplate
}
