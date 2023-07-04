'use strict'
module.exports = (sequelize, DataTypes) => {
	const Form = sequelize.define(
		'Form',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			sub_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			data: DataTypes.JSON,
		},
		{ sequelize, modelName: 'Form', tableName: 'forms', freezeTableName: true, paranoid: true }
	)
	return Form
}
