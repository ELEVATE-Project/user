'use strict'
module.exports = (sequelize, DataTypes) => {
	const UserOrganization = sequelize.define(
		'UserOrganization',
		{
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			organization_code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			tenant_code: {
				type: DataTypes.STRING,
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
			tableName: 'user_organizations',
			freezeTableName: true,
			paranoid: true,
		}
	)

	UserOrganization.associate = function (models) {
		UserOrganization.belongsTo(models.Tenant, {
			foreignKey: 'tenant_code',
			targetKey: 'code',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		})
	}

	return UserOrganization
}
