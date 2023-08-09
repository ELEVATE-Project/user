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
			value: { type: DataTypes.STRING, allowNull: false, unique: true },
			label: { type: DataTypes.STRING, allowNull: false },
			status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ACTIVE' },
			created_by: { type: DataTypes.INTEGER, allowNull: false },
			updated_by: { type: DataTypes.INTEGER, allowNull: false },
			allow_filtering: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			data_type: { type: DataTypes.STRING, allowNull: false },
		},
		{ sequelize, modelName: 'EntityType', tableName: 'entity_types', freezeTableName: true, paranoid: true }
	)
	EntityType.associate = (models) => {
		EntityType.hasMany(models.Entity, {
			foreignKey: 'entity_type_id',
			as: 'entities',
			scope: {
				deleted_at: null, // Only associate with active EntityType records
			},
		})
	}

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
			// Handle any error that might occur during the soft deletion of associated Entity records
			console.error('Error during beforeDestroy hook:', error)
			// Optionally, you can throw the error to prevent the soft deletion of the EntityType record
			throw error
		}
	})

	return EntityType
}
