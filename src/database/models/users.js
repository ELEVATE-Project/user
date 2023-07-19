'use strict'
module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define(
		'User',
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
			status: {
				type: DataTypes.STRING,
				defaultValue: 'active',
			},
			image: DataTypes.STRING,
			last_logged_in_at: DataTypes.DATE,
			has_accepted_terms_and_conditions: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			refresh_token: DataTypes.ARRAY(DataTypes.JSONB),
			languages: DataTypes.ARRAY(DataTypes.STRING),
			preferred_language: {
				type: DataTypes.STRING,
				defaultValue: 'en',
			},
			organization_id: DataTypes.INTEGER,
			role_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{ sequelize, modelName: 'User', tableName: 'users', freezeTableName: true, paranoid: true }
	)
	User.associate = (models) => {
		User.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' }),
		User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' })
	}
	return User
}
