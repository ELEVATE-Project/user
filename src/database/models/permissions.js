const common = require('@constants/common')
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
				type: DataTypes.ENUM('ALL', 'READ', 'WRITE', 'UPDATE', 'DELETE'),
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: common.ACTIVE_STATUS,
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
