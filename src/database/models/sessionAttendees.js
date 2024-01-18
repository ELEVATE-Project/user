module.exports = (sequelize, DataTypes) => {
	const SessionAttendee = sequelize.define(
		'SessionAttendee',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			mentee_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			session_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			time_zone: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			joined_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			left_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			is_feedback_skipped: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			meeting_info: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: 'ENROLLED',
			},
		},
		{
			sequelize,
			modelName: 'SessionAttendee',
			tableName: 'session_attendees',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return SessionAttendee
}
