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
			location: DataTypes.STRING,
			about: DataTypes.TEXT,
			share_link: DataTypes.STRING,
			status: {
				type: DataTypes.STRING,
				defaultValue: 'ACTIVE',
			},
			image: DataTypes.STRING,
			has_accepted_terms_and_conditions: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			languages: DataTypes.ARRAY(DataTypes.STRING),
			preferred_language: {
				type: DataTypes.STRING,
				defaultValue: 'en',
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			roles: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: false,
			},
			custom_entity_text: {
				type: DataTypes.JSON,
			},
			meta: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
		},
		{ sequelize, modelName: 'User', tableName: 'users', freezeTableName: true, paranoid: true }
	)
	User.associate = (models) => {
		User.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' })
	}
	return User
}
