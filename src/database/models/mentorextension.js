'use strict'
module.exports = (sequelize, DataTypes) => {
	const MentorExtension = sequelize.define(
		'MentorExtension',
		{
			user_id: {
				allowNull: false,
				primaryKey: true,
				type: DataTypes.INTEGER,
			},
			designation: {
				type: DataTypes.STRING,
			},
			area_of_expertise: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			education_qualification: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			rating: {
				type: DataTypes.JSON,
			},
			user_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			meta: {
				type: DataTypes.JSONB,
			},
			stats: {
				type: DataTypes.JSONB,
			},
			tags: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			configs: {
				type: DataTypes.JSON,
			},
			visibility: {
				type: DataTypes.STRING,
			},
			organisation_ids: {
				type: DataTypes.ARRAY(DataTypes.INTEGER),
			},
			external_session_visibility: {
				type: DataTypes.STRING,
			},
			external_mentor_visibility: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize,
			modelName: 'MentorExtension',
			tableName: 'mentor_extensions',
			freezeTableName: true,
			paranoid: true,
		}
	)
	return MentorExtension
}
