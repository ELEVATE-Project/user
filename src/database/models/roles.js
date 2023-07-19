'use strict'
module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define(
		'Role',
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
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{ sequelize, modelName: 'Role', tableName: 'roles', freezeTableName: true, paranoid: true }
	)

	return Role
}
