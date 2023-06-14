module.exports = (sequelize, DataTypes) => {
	const SessionEnrollment = sequelize.define(
		'SessionEnrollment',
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
		},
		{
			sequelize,
			modelName: 'SessionEnrollment',
			tableName: 'session_enrollments',
			freezeTableName: true,
			paranoid: true,
		}
	)
	return SessionEnrollment
}
