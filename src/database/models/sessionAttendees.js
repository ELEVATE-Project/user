module.exports = (sequelize, DataTypes) => {
	const SessionAttendees = sequelize.define('session_attendees', {
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
			allowNull: false,
		},
		left_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		is_feedback_skipped: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		meeting_info: {
			type: DataTypes.JSON,
			allowNull: true,
		},
	})

	return SessionAttendees
}
