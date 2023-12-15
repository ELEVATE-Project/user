module.exports = (sequelize, DataTypes) => {
	const Permission = sequelize.define(
		'Permission',
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
			module: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			actions: {
				allowNull: false,
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'ACTIVE',
			},
		},
		{
			sequelize,
			modelName: 'Permission',
			tableName: 'permissions',
			freezeTableName: true,
			indexes: [{ unique: true, fields: ['code'] }],
			paranoid: true,
		}
	)

	return Permission
}
