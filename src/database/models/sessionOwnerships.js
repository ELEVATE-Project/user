module.exports = (sequelize, DataTypes) => {
	const SessionOwnerships = sequelize.define('session_ownerships', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		mentor_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		session_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	})

	return SessionOwnerships
}
