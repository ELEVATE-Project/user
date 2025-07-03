'use strict'
module.exports = (sequelize, DataTypes) => {
	const Organization = sequelize.define(
		'Organization',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'ACTIVE',
			},
			org_admin: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			parent_id: {
				type: DataTypes.INTEGER,
			},
			related_orgs: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			in_domain_visibility: {
				type: DataTypes.STRING,
			},
			tenant_code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			meta: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
			updated_by: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: 'Organization',
			tableName: 'organizations',
			freezeTableName: true,
			paranoid: true,
		}
	)

	Organization.associate = function (models) {
		// Existing association with UserOrganization
		Organization.hasMany(models.UserOrganization, {
			foreignKey: 'organization_code',
			sourceKey: 'code',
			as: 'user_organizations',
		})

		// New association with Tenant
		Organization.belongsTo(models.Tenant, {
			foreignKey: 'tenant_code',
			targetKey: 'code',
			as: 'tenant',
		})

		// Association with OrganizationRegistrationCode
		Organization.hasMany(models.OrganizationRegistrationCode, {
			foreignKey: 'organization_code',
			sourceKey: 'code',
			as: 'organizationRegistrationCodes',
		})
	}

	return Organization
}
