'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	const OrganizationExtension = sequelize.define(
		'OrganizationExtension',
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
			mentee_feedback_question_set: {
				allowNull: true,
				type: DataTypes.STRING,
				defaultValue: 'MENTEE_QS1',
			},
			mentor_feedback_question_set: {
				allowNull: true,
				type: DataTypes.STRING,
				defaultValue: 'MENTOR_QS2',
			},
		},
		{
			sequelize,
			modelName: 'OrganizationExtension',
			tableName: 'organization_extension',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return OrganizationExtension
}
