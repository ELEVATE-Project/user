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
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			time_zone: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			start_date: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			end_date: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			mentee_password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			mentor_password: {
				type: DataTypes.STRING,
				allowNull: false,
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
			},
			mentee_feedback_question_set: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			mentor_feedback_question_set: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			meeting_info: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			meta: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			visibility: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			organization_ids: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
			},
			mentor_org_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{ sequelize, modelName: 'Session', tableName: 'sessions', freezeTableName: true, paranoid: true }
	)
	return Session
}
