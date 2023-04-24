/**
 * name : models/sessions/schema
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : Sessions schema data
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseLeanGetter = require('mongoose-lean-getters')

let sessionsSchema = new Schema({
	title: String,
	description: String,
	recommendedFor: Array,
	categories: Array,
	medium: Array,
	image: Array,
	userId: {
		type: mongoose.Types.ObjectId,
		index: true,
	},

	sessionReschedule: Number,
	status: {
		type: String,
		index: true,
		default: 'published',
	},
	deleted: {
		type: Boolean,
		default: false,
	},
	timeZone: String,
	startDate: String,
	endDate: String,
	startDateUtc: String,
	endDateUtc: String,
	menteePassword: String,
	mentorPassword: String,
	startedAt: Date,
	shareLink: String,
	completedAt: Date,
	feedbacks: [
		{
			questionId: mongoose.Types.ObjectId,
			value: String,
			label: String,
		},
	],
	skippedFeedback: {
		type: Boolean,
		default: false,
	},
	isStarted: {
		type: Boolean,
		default: false,
	},
	menteeFeedbackForm: {
		type: String,
		default: 'menteeQS1',
	},
	mentorFeedbackForm: {
		type: String,
		default: 'mentorQS2',
	},
	recordings: Object,
	recordingUrl: {
		type: String,
		default: null,
	},
	meetingInfo: {
		platform: {
			type: String,
			default: process.env.DEFAULT_MEETING_SERVICE,
		},
		link: String,
		meta: {
			meetingId: String,
			password: String,
		},
	},
})
sessionsSchema.plugin(mongooseLeanGetter)
const Sessions = db.model('sessions', sessionsSchema)
module.exports = Sessions
