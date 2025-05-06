'use strict'
module.exports = (sequelize, DataTypes) => {
	const UserOrganizationRole = sequelize.define(
		'UserOrganizationRole',
		{
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			organization_code: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			tenant_code: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			role_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: 'UserOrganization',
			tableName: 'user_organization_roles',
			freezeTableName: true,
			paranoid: true,
		}
	)

	UserOrganizationRole.associate = function (models) {
		UserOrganizationRole.belongsTo(models.Tenant, {
			foreignKey: 'tenant_code',
			targetKey: 'code',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		})
	}

	return UserOrganizationRole
}
