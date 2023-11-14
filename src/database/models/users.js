'use strict'

const { DATE } = require('sequelize')

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
				defaultValue: 'ACTIVE',
			},
			image: DataTypes.STRING,
			last_logged_in_at: DataTypes.DATE,
			has_accepted_terms_and_conditions: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			status_updated_at: DataTypes.DATE,
			refresh_tokens: DataTypes.ARRAY(DataTypes.JSONB),
			languages: DataTypes.ARRAY(DataTypes.STRING),
			preferred_language: {
				type: DataTypes.STRING,
				defaultValue: 'en',
			},
			organization_id: DataTypes.INTEGER,
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
		User.hasMany(models.FileUpload, { foreignKey: 'id', as: 'invite_file_uploads' })
		User.hasMany(models.OrgRoleRequest, { as: 'requested_roles', foreignKey: 'requester_id' })
		User.hasMany(models.OrgRoleRequest, { as: 'handled_requests', foreignKey: 'handled_by' })
	}
	return User
}
