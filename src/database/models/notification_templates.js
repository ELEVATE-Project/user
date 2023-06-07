module.exports = (sequelize, DataTypes) => {
	const notification_templates = sequelize.define(
		'notification_templates',
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
			subject: DataTypes.STRING,
			body: DataTypes.TEXT,
			status: DataTypes.STRING,
			email_header: DataTypes.STRING,
			email_footer: DataTypes.STRING,
			created_by: DataTypes.STRING,
			updated_by: DataTypes.STRING,
		},
		{
			freezeTableName: true,
			paranoid: true,
		}
	)
	return notification_templates
}
