module.exports = (sequelize, DataTypes) => {
	const RolePermission = sequelize.define(
		'RolePermission',
		{
			role_id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
			},
			permission_id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
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
			created_by: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			modelName: 'RolePermission',
			tableName: 'role_permission_mapping',
			freezeTableName: true,
			paranoid: false,
		}
	)

	return RolePermission
}
