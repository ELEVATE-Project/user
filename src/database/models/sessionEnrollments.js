module.exports = (sequelize, DataTypes) => {
	const SessionEnrollments = sequelize.define('session_enrollments', {
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
	})

	return SessionEnrollments
}
