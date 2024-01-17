module.exports = (sequelize, DataTypes) => {
	const SessionOwnership = sequelize.define(
		'SessionOwnership',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
			},
			mentor_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			session_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
		},
		{
			sequelize,
			modelName: 'SessionOwnership',
			tableName: 'session_ownerships',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return SessionOwnership
}
