'use strict'
module.exports = (sequelize, DataTypes) => {
	const Feedback = sequelize.define(
		'Feedback',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			session_id: { type: DataTypes.INTEGER, allowNull: false },
			question_id: { type: DataTypes.INTEGER, allowNull: false },
			response: { type: DataTypes.STRING },
			meta: {
				type: DataTypes.JSON,
			},
			user_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
		},
		{ sequelize, modelName: 'Feedback', tableName: 'feedbacks', freezeTableName: true, paranoid: true }
	)
	return Feedback
}
