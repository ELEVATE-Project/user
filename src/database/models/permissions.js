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
				unique: true,
			},
			module: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			request_type: {
				allowNull: false,
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			api_path: {
				allowNull: false,
				type: DataTypes.STRING,
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
			indexes: [
				{
					unique: true,
					fields: ['code'],
					where: {
						deleted_at: null,
					},
				},
			],
			paranoid: true,
		}
	)

	return Permission
}
