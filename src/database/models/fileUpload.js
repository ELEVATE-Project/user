'use strict'
module.exports = (sequelize, DataTypes) => {
	const FileUpload = sequelize.define(
		'FileUpload',
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
				unique: true,
			},
			input_path: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'UPLOADED',
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			output_path: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
			updated_by: {
				type: DataTypes.INTEGER,
			},
		},
		{ sequelize, modelName: 'FileUpload', tableName: 'file_uploads', freezeTableName: true, paranoid: true }
	)

	return FileUpload
}
