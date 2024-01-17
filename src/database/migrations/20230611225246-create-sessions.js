'use strict'
require('dotenv').config({ path: '../../.env' })
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('sessions', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			recommended_for: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: false,
			},
			categories: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: false,
			},
			medium: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: false,
			},
			image: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: false,
			},
			mentor_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			session_reschedule: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			status: {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: 'PUBLISHED',
			},
			time_zone: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			start_date: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
			end_date: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
			mentee_password: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			mentor_password: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			started_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			share_link: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			completed_at: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			is_feedback_skipped: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			mentee_feedback_question_set: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			mentor_feedback_question_set: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			meeting_info: {
				type: Sequelize.JSONB,
				allowNull: true,
			},
			meta: {
				type: Sequelize.JSONB,
				allowNull: true,
			},
			visibility: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			organization_ids: {
				type: Sequelize.ARRAY(Sequelize.STRING),
				allowNull: true,
			},
			mentor_org_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			seats_remaining: {
				type: Sequelize.INTEGER,
				defaultValue: process.env.SESSION_MENTEE_LIMIT,
			},
			seats_limit: {
				type: Sequelize.INTEGER,
				defaultValue: process.env.SESSION_MENTEE_LIMIT,
			},
			custom_entity_text: {
				type: Sequelize.JSON,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('sessions')
	},
}
