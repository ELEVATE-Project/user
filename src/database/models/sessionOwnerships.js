module.exports = (sequelize, DataTypes) => {
	const SessionOwnerships = sequelize.define(
		'SessionOwnership',
		{
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
		},
		{
			sequelize,
			modelName: 'SessionOwnership',
			tableName: 'session_ownerships',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return SessionOwnerships
}
