'use strict'
module.exports = (sequelize, DataTypes) => {
	const OrgDomain = sequelize.define(
		'OrgDomain',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			org_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			domain: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'ACTIVE',
			},
		},
		{ sequelize, modelName: 'OrgDomain', tableName: 'org_domains', freezeTableName: true, paranoid: true }
	)

	return OrgDomain
}
