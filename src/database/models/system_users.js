module.exports = (sequelize, DataTypes) => {
	const systemUsers = sequelize.define(
		"system_users",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			role: {
				type: DataTypes.STRING,
				allowNull: false,
			}
		},
		{ freezeTableName: true, paranoid: true }
	)
	// systemUsers.associate = (models) => {
	// 	systemUsers.belongsTo(models.organizations, { foreignKey: 'organization_id' })
	// }
	/* 	Users.associate = function (models) {
		// associations can be defined here
		Users.hasMany(models.Post, {
			foreignKey: 'userId',
			as: 'posts',
			onDelete: 'CASCADE',
		})

		Users.hasMany(models.Comment, {
			foreignKey: 'userId',
			as: 'comments',
			onDelete: 'CASCADE',
		})
	} */
	return systemUsers
}

