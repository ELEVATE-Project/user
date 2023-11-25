'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	const OrganisationExtension = sequelize.define(
		'OrganisationExtension',
		{
			organization_id: {
				allowNull: false,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			session_visibility_policy: { type: DataTypes.STRING },
			mentor_visibility_policy: { type: DataTypes.STRING },
			external_session_visibility_policy: { type: DataTypes.STRING },
			external_mentor_visibility_policy: { type: DataTypes.STRING },
			approval_required_for: { type: DataTypes.ARRAY(DataTypes.STRING) },
			allow_mentor_override: DataTypes.BOOLEAN,
			created_by: {
				allowNull: true,
				type: DataTypes.INTEGER,
			},
			updated_by: {
				allowNull: true,
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: 'OrganisationExtension',
			tableName: 'organisation_extension',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return OrganisationExtension
}
