'use strict'
module.exports = (sequelize, DataTypes) => {
	const OrganizationUserInvite = sequelize.define(
		'OrganizationUserInvite',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'ACTIVE',
			},
			organization_code: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			roles: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: false,
			},
			file_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			username: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			phone: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			phone_code: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			meta: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			invitation_key: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},
			invitation_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Invitation',
					key: 'id',
				},
			},
			tenant_code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			invitation_code: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: 'OrganizationUserInvite',
			tableName: 'organization_user_invites',
			freezeTableName: true,
			paranoid: true,
			indexes: [
				{
					unique: true,
					fields: ['invitation_code', 'tenant_code'],
					name: 'invitations_invitation_code_tenant_code_unique',
				},
				{
					unique: true,
					fields: ['invitation_key', 'tenant_code'],
					name: 'invitations_invitation_key_tenant_code_unique',
				},
			],
		}
	)
	// Many-to-one: Many OrganizationUserInvites belong to one Invitation
	OrganizationUserInvite.associate = (models) => {
		OrganizationUserInvite.belongsTo(models.Invitation, {
			foreignKey: 'invitation_id',
			targetKey: 'id',
			as: 'invitation',
		})
	}

	return OrganizationUserInvite
}
