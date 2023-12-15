module.exports = (sequelize, DataTypes) => {
	const Module = sequelize.define(
		'Module',
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'ACTIVE',
			},
		},
		{
			sequelize,
			modelName: 'Module',
			tableName: 'modules',
			freezeTableName: true,
			indexes: [{ unique: true, fields: ['code'] }],
			paranoid: true,
		}
	)

	Module.addHook('beforeDestroy', async (instance, options) => {
		try {
			// Soft-delete associated Permissions records with matching module
			await sequelize.models.Permission.update(
				{ deleted_at: new Date() }, // Set the deleted_at column to the current timestamp
				{
					where: {
						module: instance.code, // instance.code contains the code of the Modules record being deleted
					},
				}
			)
		} catch (error) {
			console.error('Error during beforeDestroy hook:', error)
			throw error
		}
	})

	return Module
}
