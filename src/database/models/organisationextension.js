'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	const OrganisationExtension = sequelize.define(
		'OrganisationExtension',
		{
			org_id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			session_visibility_policy: { type: DataTypes.STRING },
			mentor_visibility_policy: { type: DataTypes.STRING },
			external_session_visibility_policy: { type: DataTypes.STRING },
			external_mentor_visibility_policy: { type: DataTypes.STRING },
			is_approval_required: { type: DataTypes.STRING },
			allow_mentor_override: DataTypes.BOOLEAN,
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
