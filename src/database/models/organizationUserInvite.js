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
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'ACTIVE',
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
			file_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
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
		}
	)

	return OrganizationUserInvite
}
