const crypto = require('crypto')

module.exports = (sequelize, DataTypes) => {
	const Log = sequelize.define(
		'Log',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			email: {
				type: DataTypes.ARRAY(DataTypes.TEXT),
				allowNull: false,
				set(emails) {
					this.setDataValue('email', hashEmails(emails))
				},
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'EMAIL',
			},
			status: {
				type: DataTypes.ENUM('SENT', 'FAILED'),
				allowNull: false,
				defaultValue: 'SENT',
			},
			error: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			response_code: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			meta: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
		},
		{ sequelize, modelName: 'Log', tableName: 'logs', freezeTableName: true, paranoid: true }
	)

	// Function to hash an email address or an array of email addresses
	function hashEmails(emails) {
		return Array.isArray(emails) ? emails.map((email) => hashEmail(email)) : [hashEmail(emails)]
	}

	function hashEmail(email) {
		return crypto.createHash('sha256').update(email).digest('hex')
	}

	return Log
}
