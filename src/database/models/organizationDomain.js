'use strict'
module.exports = (sequelize, DataTypes) => {
	const OrganizationDomain = sequelize.define(
		'OrganizationDomain',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			domain: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'ACTIVE',
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
			modelName: 'OrganizationDomain',
			tableName: 'organization_domains',
			indexes: [
				{
					unique: true,
					fields: ['organization_id', 'domain'],
				},
			],
			freezeTableName: true,
			paranoid: true,
		}
	)

	/* 	OrganizationDomain.associate = (models) => {
		OrganizationDomain.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' })
	} */

	return OrganizationDomain
}
