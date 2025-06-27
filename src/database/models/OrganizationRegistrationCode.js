'use strict'
module.exports = (sequelize, DataTypes) => {
	const OrganizationRegistrationCode = sequelize.define(
		'OrganizationRegistrationCode',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			registration_code: {
				type: DataTypes.STRING(32),
				allowNull: false,
			},
			organization_code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'ACTIVE',
			},
			created_by: {
				type: DataTypes.INTEGER,
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
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			deleted_at: {
				type: DataTypes.DATE,
				allowNull: true,
				default: null,
			},
		},
		{
			sequelize,
			modelName: 'OrganizationRegistrationCode',
			tableName: 'organization_registration_codes',
			freezeTableName: true,
			paranoid: true,
			indexes: [
				{
					name: 'index_registration_code_organization_code_tenant_code',
					fields: ['registration_code', 'tenant_code'],
					unique: true,
				},
				{
					name: 'index_organization_code_tenant_code',
					fields: ['organization_code', 'tenant_code'],
				},
			],
		}
	)

	// Many-to-one: Many OrganizationRegistrationCodes belong to one Organization
	OrganizationRegistrationCode.associate = (models) => {
		OrganizationRegistrationCode.belongsTo(models.Organization, {
			foreignKey: 'organization_code',
			targetKey: 'code',
			as: 'organization',
		})
	}

	// // Constraints for the table
	OrganizationRegistrationCode.constraints = [
		{
			name: 'fk_organization_code_tenant_code_in_org_reg_code',
			type: 'foreign key',
			fields: ['organization_code', 'tenant_code'],
			references: {
				table: 'organizations',
				fields: ['code', 'tenant_code'],
			},
			onUpdate: 'NO ACTION',
			onDelete: 'CASCADE',
		},
	]

	return OrganizationRegistrationCode
}
