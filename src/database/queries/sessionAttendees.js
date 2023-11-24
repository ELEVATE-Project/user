const SessionAttendee = require('@database/models/index').SessionAttendee
const { Op } = require('sequelize')
const SessionEnrollment = require('@database/models/index').SessionEnrollment

exports.create = async (data) => {
	try {
		return await SessionAttendee.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		const res = await SessionAttendee.findOne({
			where: filter,
			...options,
			raw: true,
		})
		return res
	} catch (error) {
		return error
	}
}

exports.updateOne = async (filter, update, options = {}) => {
	try {
		return await SessionAttendee.update(update, {
			where: filter,
			...options,
			individualHooks: true,
		})
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.unEnrollFromSession = async (sessionId, userId) => {
	try {
		const result = await SessionAttendee.destroy({
			where: {
				session_id: sessionId,
				mentee_id: userId,
			},
		})

		return result
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await SessionAttendee.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.unEnrollAllAttendeesOfSessions = async (sessionIds) => {
	try {
		const destroyedCount = await SessionAttendee.destroy({
			where: {
				session_id: { [Op.in]: sessionIds },
			},
		})
		await SessionEnrollment.destroy({
			where: {
				session_id: { [Op.in]: sessionIds },
			},
		})

		return destroyedCount
	} catch (error) {
		console.error('An error occurred:', error)
		throw error
	}
}

exports.usersUpcomingSessions = async (userId, sessionIds) => {
	try {
		return await SessionAttendee.findAll({
			where: {
				session_id: sessionIds,
				mentee_id: userId,
			},
			raw: true,
		})
	} catch (error) {
		console.error('An error occurred:', error)
		throw error
	}
}

exports.unenrollFromUpcomingSessions = async (userId, sessionIds) => {
	try {
		const result = await SessionAttendee.destroy({
			where: {
				session_id: sessionIds,
				mentee_id: userId,
			},
		})
		await SessionEnrollment.destroy({
			where: {
				session_id: sessionIds,
				mentee_id: userId,
			},
		})
		return result
	} catch (error) {
		console.error('An error occurred:', error)
		throw error
	}
}
exports.countEnrolledSessions = async (mentee_id) => {
	try {
		let sessionEnrollments = await SessionEnrollment.findAll({
			where: {
				mentee_id: mentee_id,
			},
		})
		const sessionIds = sessionEnrollments.map((enrollment) => enrollment.session_id)
		if (sessionIds.length <= 0) {
			return 0
		}
		return await SessionAttendee.count({
			where: {
				joined_at: {
					[Op.not]: null,
				},
				session_id: sessionIds,
			},
		})
	} catch (error) {
		return error
	}
}

exports.getEnrolledSessionsCountInDateRange = async (startDate, endDate, mentee_id) => {
	try {
		let sessionEnrollments = await SessionEnrollment.findAll({
			where: {
				mentee_id: mentee_id,
			},
		})
		const sessionIds = sessionEnrollments.map((enrollment) => enrollment.session_id)
		if (sessionIds.length <= 0) {
			return 0
		}
		return await SessionAttendee.count({
			where: {
				created_at: {
					[Op.between]: [startDate, endDate],
				},
				session_id: sessionIds,
				mentee_id: mentee_id,
			},
		})
	} catch (error) {
		return error
	}
}

exports.getAttendedSessionsCountInDateRange = async (startDate, endDate, mentee_id) => {
	try {
		let sessionEnrollments = await SessionEnrollment.findAll({
			where: {
				mentee_id: mentee_id,
			},
		})
		const sessionIds = sessionEnrollments.map((enrollment) => enrollment.session_id)
		if (sessionIds.length <= 0) {
			return 0
		}
		return await SessionAttendee.count({
			where: {
				joined_at: {
					[Op.between]: [startDate, endDate],
				},
				session_id: sessionIds,
				mentee_id: mentee_id,
			},
		})
	} catch (error) {
		console.error(error)
		return error
	}
}
exports.findAttendeeBySessionAndUserId = async (id, sessionId) => {
	try {
		const attendee = await SessionAttendee.findOne({
			where: {
				mentee_id: id,
				session_id: sessionId,
			},
			raw: true,
		})
		return attendee
	} catch (error) {
		return error
	}
}
exports.findPendingFeedbackSessions = async (menteeId, completedSessionIds) => {
	try {
		let sessionEnrollments = await SessionEnrollment.findAll({
			where: {
				mentee_id: menteeId,
			},
		})
		const sessionIds = sessionEnrollments.map((enrollment) => enrollment.session_id)
		const filteredSessionIds = sessionIds.filter((sessionId) => !completedSessionIds.includes(sessionId))
		return await SessionAttendee.findAll({
			where: {
				joined_at: {
					[Op.not]: null,
				},
				is_feedback_skipped: false,
				session_id: filteredSessionIds,
			},
			raw: true,
		})
	} catch (error) {
		return error
	}
}
