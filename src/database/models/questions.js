module.exports = (sequelize, DataTypes) => {
	const Question = sequelize.define(
		'Question',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			question: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			options: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			no_of_stars: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			category: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			rendering_data: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			meta: {
				type: DataTypes.JSON,
				allowNull: true,
			},
		},
		{ sequelize, modelName: 'Question', tableName: 'questions', freezeTableName: true, paranoid: true }
	)

	return Question
}
