/**
 * name : models/sessionAttendees/schema
 * author : Aman Karki
 * Date : 07-Oct-2021
 * Description : Session Attendees schema data
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId
const mongooseLeanGetter = require('mongoose-lean-getters')
let sessionAttendeesSchema = new Schema({
	userId: {
		type: ObjectId,
		index: true,
		required: true,
	},
	sessionId: {
		type: ObjectId,
		index: true,
		required: true,
	},
	isSessionAttended: {
		type: Boolean,
		default: false,
	},
	deleted: {
		type: Boolean,
		default: false,
	},
	timeZone: String,
	joinedAt: Date,
	leftAt: Date,
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
	meetingInfo: {
		platform: String,
		link: String,
		meta: {
			meetingId: String,
			password: String,
		},
	},
})

sessionAttendeesSchema.post('save', async function (doc, next) {
	try {
		const sessionId = doc.sessionId
		const sessionMenteeLimit = parseInt(process.env.SESSION_MENTEE_LIMIT)

		const count = await this.model('sessionAttendees').countDocuments({ sessionId, deleted: false }).exec()

		if (sessionMenteeLimit !== 0 && count > sessionMenteeLimit) {
			await doc.remove()
			return next('SESSION_SEAT_FULL')
		}
		next()
	} catch (err) {
		next(err)
	}
})

sessionAttendeesSchema.plugin(mongooseLeanGetter)
const SessionAttendes = db.model('sessionAttendees', sessionAttendeesSchema, 'sessionAttendees')
module.exports = SessionAttendes
