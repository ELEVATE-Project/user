module.exports = (sequelize, DataTypes) => {
	const QuestionSet = sequelize.define(
		'QuestionSet',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			questions: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
			},
			code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			meta: {
				type: DataTypes.JSON,
				allowNull: true,
			},
		},
		{ sequelize, modelName: 'QuestionSet', tableName: 'question_sets', freezeTableName: true, paranoid: true }
	)

	return QuestionSet
}
