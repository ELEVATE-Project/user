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
				defaultValue: 'ACTIVE',
			},
			email_header: DataTypes.STRING,
			email_footer: DataTypes.STRING,
			created_by: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			updated_by: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
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
