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
			value: { type: DataTypes.STRING, allowNull: false },
			label: { type: DataTypes.STRING, allowNull: false },
			status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ACTIVE' },
			created_by: { type: DataTypes.INTEGER, allowNull: true },
			updated_by: { type: DataTypes.INTEGER, allowNull: true },
			allow_filtering: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
			data_type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'STRING' },
			organization_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, primaryKey: true },
			parent_id: { type: DataTypes.INTEGER, allowNull: true },
			allow_custom_entities: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
			has_entities: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
			model_names: { type: DataTypes.ARRAY(DataTypes.STRING) },
		},
		{ sequelize, modelName: 'EntityType', tableName: 'entity_types', freezeTableName: true, paranoid: true }
	)
	/* 	EntityType.associate = (models) => {
		EntityType.hasMany(models.Entity, {
			foreignKey: 'entity_type_id',
			as: 'entities',
			scope: {
				deleted_at: null, // Only associate with active EntityType records
			},
		})
	} */

	EntityType.addHook('beforeDestroy', async (instance, options) => {
		try {
			// Soft-delete only the associated Entity records with matching entity_type_id
			await sequelize.models.Entity.update(
				{ deleted_at: new Date() }, // Set the deleted_at column to the current timestamp
				{
					where: {
						entity_type_id: instance.id, // instance.id contains the primary key of the EntityType record being deleted
					},
				}
			)
		} catch (error) {
			console.error('Error during beforeDestroy hook:', error)
			throw error
		}
	})

	return EntityType
}
