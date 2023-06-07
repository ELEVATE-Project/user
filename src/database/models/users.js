module.exports = (sequelize, DataTypes) => {
	const users = sequelize.define(
		'users',
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
			email_verified: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: false,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			gender: DataTypes.STRING,
			location: DataTypes.ARRAY(DataTypes.STRING),
			about: DataTypes.STRING,
			share_link: DataTypes.STRING,
			status: DataTypes.STRING,
			image: DataTypes.STRING,
			last_logged_in_at: DataTypes.DATE,
			has_accepted_terms_and_conditions: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			refresh_token: DataTypes.ARRAY(DataTypes.STRING),
			languages: DataTypes.ARRAY(DataTypes.STRING),
			preferred_language: {
				type: DataTypes.STRING,
				defaultValue: 'en',
			},
			organization_id: DataTypes.INTEGER,
		},
		{ freezeTableName: true, paranoid: true }
	)
	users.associate = (models) => {
		users.belongsTo(models.organizations, { foreignKey: 'organization_id' })
	}
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
	return users
}
