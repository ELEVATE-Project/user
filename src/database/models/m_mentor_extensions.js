'use strict'
module.exports = (sequelize, DataTypes) => {
	const m_mentor_extensions = sequelize.define(
		'm_mentor_extensions',
		{
			user_id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
			},
			designation: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			area_of_expertise: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			education_qualification: {
				type: DataTypes.STRING,
			},
			rating: {
				type: DataTypes.JSON,
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
				type: DataTypes.STRING,
			},
			external_session_visibility: {
				type: DataTypes.STRING,
			},
			external_mentor_visibility: {
				type: DataTypes.STRING,
			},
			custom_entity_text: {
				type: DataTypes.JSON,
			},
			experience: {
				type: DataTypes.STRING,
			},
			created_at: {
				type: DataTypes.DATE,
			},
			updated_at: {
				type: DataTypes.DATE,
			},
			deleted_at: {
				type: DataTypes.DATE,
			},
			location: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize,
			modelName: 'm_mentor_extensions',
			tableName: 'm_mentor_extensions',
			freezeTableName: true,
			paranoid: true,
		}
	)
	return m_mentor_extensions
}
