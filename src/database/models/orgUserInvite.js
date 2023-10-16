'use strict'
module.exports = (sequelize, DataTypes) => {
	const OrgUserInvite = sequelize.define(
		'OrgUserInvite',
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
			status: {
				type: DataTypes.STRING,
				defaultValue: 'ACTIVE',
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			roles: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
				allowNull: false,
			},
			file_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
		},
		{ sequelize, modelName: 'OrgUserInvite', tableName: 'org_user_invites', freezeTableName: true, paranoid: true }
	)

	OrgUserInvite.associate = (models) => {
		OrgUserInvite.belongsTo(models.FileUpload, { as: 'file', foreignKey: 'file_id' })
	}

	return OrgUserInvite
}
