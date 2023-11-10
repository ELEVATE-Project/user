'use strict'
module.exports = (sequelize, DataTypes) => {
	const m_sessions = sequelize.define(
		'm_sessions',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
			},
			title: {
				type: DataTypes.STRING,
			},
			description: {
				type: DataTypes.STRING,
			},
			recommended_for: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			categories: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			medium: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			image: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			mentor_id: {
				type: DataTypes.INTEGER,
			},
			session_reschedule: {
				type: DataTypes.INTEGER,
			},
			status: {
				type: DataTypes.STRING,
			},
			time_zone: {
				type: DataTypes.STRING,
			},
			start_date: {
				type: DataTypes.STRING,
			},
			end_date: {
				type: DataTypes.STRING,
			},
			mentee_password: {
				type: DataTypes.STRING,
			},
			mentor_password: {
				type: DataTypes.STRING,
			},
			started_at: {
				type: DataTypes.DATE,
			},
			share_link: {
				type: DataTypes.STRING,
			},
			completed_at: {
				type: DataTypes.DATE,
			},
			is_feedback_skipped: {
				type: DataTypes.BOOLEAN,
			},
			mentee_feedback_question_set: {
				type: DataTypes.STRING,
			},
			mentor_feedback_question_set: {
				type: DataTypes.STRING,
			},
			meeting_info: {
				type: DataTypes.JSONB,
			},
			meta: {
				type: DataTypes.JSONB,
			},
			visibility: {
				type: DataTypes.STRING,
			},
			organization_ids: {
				type: DataTypes.ARRAY(DataTypes.STRING),
			},
			mentor_org_id: {
				type: DataTypes.INTEGER,
			},
			seats_remaining: {
				type: DataTypes.INTEGER,
			},
			seats_limit: {
				type: DataTypes.INTEGER,
			},
			custom_entity_text: {
				type: DataTypes.JSON,
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
		},
		{
			sequelize,
			modelName: 'm_sessions',
			tableName: 'm_sessions',
			freezeTableName: true,
			paranoid: true,
		}
	)
	return m_sessions
}
