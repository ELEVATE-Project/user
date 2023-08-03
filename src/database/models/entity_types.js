'use strict'
module.exports = (sequelize, DataTypes) => {
	const EntityType = sequelize.define(
		'EntityType',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			value: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			label: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'active',
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
			updated_by: {
				type: DataTypes.INTEGER,
			},
			allow_filtering: {
				type: DataTypes.BOOLEAN,
			},
		},
		{ sequelize, modelName: 'EntityType', tableName: 'entity_types', freezeTableName: true, paranoid: true }
	)
	EntityType.associate = (models) => {
		EntityType.hasMany(models.Entity, { foreignKey: 'id' })
	}
	return EntityType
}
