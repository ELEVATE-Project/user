require('dotenv').config({ path: '../../.env' })
module.exports = (sequelize, DataTypes) => {
	const Session = sequelize.define(
		'Session',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			recommended_for: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			categories: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			medium: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			image: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			mentor_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			session_reschedule: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'PUBLISHED',
			},
			time_zone: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			start_date: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			end_date: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			mentee_password: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			mentor_password: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			started_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			share_link: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			completed_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			is_feedback_skipped: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			mentee_feedback_question_set: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: 'MENTEE_QS1',
			},
			mentor_feedback_question_set: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: 'MENTOR_QS2',
			},
			meeting_info: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			meta: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			visibility: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			visible_to_organizations: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
			},
			mentor_org_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			seats_remaining: {
				type: DataTypes.INTEGER,
				defaultValue: process.env.SESSION_MENTEE_LIMIT,
			},
			seats_limit: {
				type: DataTypes.INTEGER,
				defaultValue: process.env.SESSION_MENTEE_LIMIT,
			},
			custom_entity_text: {
				type: DataTypes.JSON,
			},
		},
		{ sequelize, modelName: 'Session', tableName: 'sessions', freezeTableName: true, paranoid: true }
	)
	return Session
}
