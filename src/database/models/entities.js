'use strict'
module.exports = (sequelize, DataTypes) => {
	const Entities = sequelize.define(
		'Entities',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			entity_type_id: { type: DataTypes.INTEGER, allowNull: false },
			value: { type: DataTypes.STRING, allowNull: false },
			label: { type: DataTypes.STRING, allowNull: false },
			status: { type: DataTypes.STRING, allowNull: false },
			type: { type: DataTypes.STRING },
			created_by: { type: DataTypes.INTEGER, allowNull: false },
			updated_by: { type: DataTypes.INTEGER, allowNull: false },
		},
		{ sequelize, modelName: 'Entities', tableName: 'entities', freezeTableName: true, paranoid: true }
	)
	return Entities
}
