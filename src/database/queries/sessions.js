const Session = require('@database/models/index').Session
const { Op, literal } = require('sequelize')
const common = require('@constants/common')
const sequelize = require('sequelize')

const moment = require('moment')
const SessionOwnership = require('../models/index').SessionOwnership
exports.getColumns = async () => {
	try {
		return await Object.keys(Session.rawAttributes)
	} catch (error) {
		return error
	}
}
exports.create = async (data) => {
	try {
		return await Session.create(data)
	} catch (error) {
		return error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		const res = await Session.findOne({
			where: filter,
			...options,
			raw: true,
		})
		return res
	} catch (error) {
		return error
	}
}

exports.findById = async (id) => {
	try {
		return await Session.findByPk(id)
	} catch (error) {
		return error
	}
}

exports.updateOne = async (filter, update, options = {}) => {
	try {
		const [rowsAffected] = await Session.update(update, {
			where: filter,
			...options,
			individualHooks: true, // Pass 'individualHooks: true' option to ensure proper triggering of 'beforeUpdate' hook.
		})

		return rowsAffected
	} catch (error) {
		return error
	}
}

exports.findAll = async (filter, options = {}) => {
	try {
		return await Session.findAll({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}

exports.updateEnrollmentCount = async (sessionId, increment = true) => {
	try {
		const options = increment ? { by: 1 } : { by: -1 }
		const result = this.incrementOrDecrement(
			{
				where: { id: sessionId },
				...options,
			},
			'seats_remaining'
		)
		return result
	} catch (error) {
		return error
	}
}

exports.incrementOrDecrement = async (filterWithOptions, incrementFields = []) => {
	try {
		return await Session.increment(incrementFields, filterWithOptions)
	} catch (error) {
		return error
	}
}

exports.getSessionByUserIdAndTime = async (userId, startDate, endDate, sessionId) => {
	try {
		let startDateResponse, endDateResponse
		const query = {
			mentor_id: userId,
			status: { [Op.ne]: common.COMPLETED_STATUS },
		}

		if (startDate) {
			query.start_date = {
				[Op.lte]: startDate,
			}
			query.end_date = {
				[Op.gte]: startDate,
			}

			if (sessionId) {
				// check if sessionId is truthy (i.e. not undefined or empty)
				query.id = { [Op.ne]: sessionId }
			}

			startDateResponse = await this.findAll(query)
		}
		if (endDate) {
			query.start_date = {
				[Op.lte]: endDate,
			}
			query.end_date = {
				[Op.gte]: endDate,
			}

			if (sessionId) {
				// check if sessionId is truthy (i.e. not undefined or empty)
				query.id = { [Op.ne]: sessionId }
			}

			endDateResponse = await this.findAll(query)
		}

		return {
			startDateResponse: startDateResponse,
			endDateResponse: endDateResponse,
		}
	} catch (error) {
		return error
	}
}

exports.deleteSession = async (filter) => {
	try {
		return await Session.destroy({
			where: filter,
		})
	} catch (error) {
		return error
	}
}

exports.updateSession = async (filter, update, options = {}) => {
	try {
		return await await Session.update(update, {
			where: filter,
			...options,
		})
	} catch (error) {
		return error
	}
}
exports.removeAndReturnMentorSessions = async (userId) => {
	try {
		const currentEpochTime = moment().unix()
		const currentDate = moment()
		const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ssZ')

		/* const foundSessionOwnerships = await SessionOwnerships.findAll({
			attributes: ['session_id'],
			where: {
				mentor_id: userId,
			},
			include: [
				{
					model: Session,
					where: {
						deleted: false,
						[Op.or]: [{ startDate: { [Op.gt]: currentEpochTime } }, { status: common.PUBLISHED_STATUS }],
					},
					attributes: ['id', 'title'],
				},
			],
		}) */
		const foundSessionOwnerships = await SessionOwnership.findAll({
			attributes: ['session_id'],
			where: {
				mentor_id: userId,
			},
			raw: true,
		})
		const sessionIds = foundSessionOwnerships.map((ownership) => ownership.session_id)
		const foundSessions = await Session.findAll({
			where: {
				id: { [Op.in]: sessionIds },
				[Op.or]: [{ start_date: { [Op.gt]: currentDateTime } }, { status: common.PUBLISHED_STATUS }],
			},
			raw: true,
		})
		const sessionIdAndTitle = foundSessions.map((session) => {
			return { id: session.id, title: session.title }
		})

		const updatedSessions = await Session.update(
			{
				deleted_at: currentDateTime,
			},
			{
				where: {
					id: { [Op.in]: sessionIds },
				},
			}
		)
		await SessionOwnership.update(
			{
				deleted_at: currentDateTime,
			},
			{
				where: {
					session_id: { [Op.in]: sessionIds },
				},
			}
		)
		const removedSessions = updatedSessions[0] === sessionIds.length ? sessionIdAndTitle : []
		return removedSessions
	} catch (error) {
		return error
	}
}

exports.findAllSessions = async (page, limit, search, filters) => {
	try {
		let filterQuery = {
			where: filters,
			raw: true,
			attributes: [
				'id',
				'title',
				'mentor_id',
				'description',
				'status',
				'start_date',
				'end_date',
				'image',
				'created_at',
				[sequelize.literal('"meeting_info"->>\'value\''), 'meeting_info.value'],
				[sequelize.literal('"meeting_info"->>\'platform\''), 'meeting_info.platform'],
			],
			offset: parseInt((page - 1) * limit, 10),
			limit: parseInt(limit, 10),
			order: [['title', 'ASC']],
		}

		if (search) {
			filterQuery.where.title = {
				[Op.iLike]: search + '%',
			}
		}

		return await Session.findAndCountAll(filterQuery)
	} catch (error) {
		return error
	}
}
exports.getAllUpcomingSessions = async (paranoid) => {
	const currentEpochTime = moment().unix()
	//const currentEpochTime = moment().format('YYYY-MM-DD HH:mm:ssZ')

	try {
		return await Session.findAll({
			paranoid: paranoid,
			where: {
				start_date: {
					[Op.gt]: currentEpochTime,
				},
			},
			raw: true,
		})
	} catch (err) {
		console.error('An error occurred:', err)
		throw err
	}
}

exports.updateEnrollmentCount = async (sessionId, increment = true) => {
	try {
		const updateFields = increment
			? { seats_remaining: literal('"seats_remaining" + 1') }
			: { seats_remaining: literal('"seats_remaining" - 1') }

		return await Session.update(updateFields, {
			where: {
				id: sessionId,
			},
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}
exports.countHostedSessions = async (id) => {
	try {
		const foundSessionOwnerships = await SessionOwnership.findAll({
			attributes: ['session_id'],
			where: {
				mentor_id: id,
			},
			raw: true,
		})

		const sessionIds = foundSessionOwnerships.map((ownership) => ownership.session_id)

		const count = await Session.count({
			where: {
				id: { [Op.in]: sessionIds },
				status: 'COMPLETED',
				started_at: {
					[Op.not]: null,
				},
			},
		})
		return count
	} catch (error) {
		return error
	}
}

exports.getCreatedSessionsCountInDateRange = async (mentorId, startDate, endDate) => {
	try {
		const foundSessionOwnerships = await SessionOwnership.findAll({
			attributes: ['session_id'],
			where: {
				mentor_id: mentorId,
			},
			raw: true,
		})

		const sessionIds = foundSessionOwnerships.map((ownership) => ownership.session_id)

		const count = await Session.count({
			where: {
				id: { [Op.in]: sessionIds },
				created_at: {
					[Op.between]: [startDate, endDate],
				},
			},
		})
		return count
	} catch (error) {
		throw error
	}
}

exports.getHostedSessionsCountInDateRange = async (mentorId, startDate, endDate) => {
	try {
		const foundSessionOwnerships = await SessionOwnership.findAll({
			attributes: ['session_id'],
			where: {
				mentor_id: mentorId,
			},
			raw: true,
		})

		const sessionIds = foundSessionOwnerships.map((ownership) => ownership.session_id)
		const count = await Session.count({
			where: {
				id: { [Op.in]: sessionIds },
				status: 'COMPLETED',
				start_date: {
					[Op.between]: [startDate, endDate],
				},
				started_at: {
					[Op.not]: null,
				},
			},
		})
		return count
	} catch (error) {
		throw error
	}
}

/* exports.getMentorsUpcomingSessions = async (mentorId) => {
	try {
		const foundSessionOwnerships = await SessionOwnership.findAll({
			attributes: ['session_id'],
			where: {
				mentor_id: mentorId,
			},
			raw: true,
		})

		const sessionIds = foundSessionOwnerships.map((ownership) => ownership.session_id)
		const currentEpochTime = moment().unix()
		console.log(sessionIds)
		console.log(currentEpochTime)
		return await Session.findAll({
			where: {
				id: { [Op.in]: sessionIds },
				status: 'PUBLISHED',
				start_date: {
					[Op.gt]: currentEpochTime,
				},
				started_at: {
					[Op.eq]: null,
				},
			},
			raw: true,
		})
	} catch (error) {
		throw error
	}
} */

exports.getMentorsUpcomingSessions = async (page, limit, search, mentorId) => {
	try {
		const foundSessionOwnerships = await SessionOwnership.findAll({
			attributes: ['session_id'],
			where: {
				mentor_id: mentorId,
			},
			raw: true,
		})

		const sessionIds = foundSessionOwnerships.map((ownership) => ownership.session_id)
		const currentEpochTime = moment().unix()

		const sessionAttendeesData = await Session.findAndCountAll({
			where: {
				[Op.and]: [
					{
						id: { [Op.in]: sessionIds },
						status: 'PUBLISHED',
						start_date: {
							[Op.gt]: currentEpochTime,
						},
						started_at: {
							[Op.eq]: null,
						},
					},
					{
						[Op.or]: [
							sequelize.where(
								sequelize.fn('LOWER', sequelize.col('title')),
								'LIKE',
								`%${search.toLowerCase()}%`
							),
						],
					},
				],
			},
			order: [['start_date', 'ASC']],
			attributes: [
				'id',
				'title',
				'description',
				'start_date',
				'end_date',
				'status',
				'image',
				'mentor_id',
				'meeting_info',
				/* 				[(sequelize.json('meeting_info.platform'), 'meeting_info.platform')],
				[sequelize.json('meeting_info.value'), 'meeting_info.value'], */
			],
			offset: limit * (page - 1),
			limit: limit,
			raw: true,
		})

		return {
			data: sessionAttendeesData.rows,
			count: sessionAttendeesData.count,
		}
	} catch (error) {
		return error
	}
}
exports.getUpcomingSessions = async (page, limit, search, userId) => {
	try {
		const currentEpochTime = moment().unix()
		const sessionData = await Session.findAndCountAll({
			where: {
				[Op.or]: [{ title: { [Op.iLike]: `%${search}%` } }], // Case-insensitive search
				mentor_id: { [Op.ne]: userId },
				end_date: {
					[Op.gt]: currentEpochTime,
				},
				status: {
					[Op.in]: ['PUBLISHED', 'LIVE'],
				},
			},
			order: [['created_at', 'DESC']],
			attributes: [
				'id',
				'title',
				'description',
				'start_date',
				'end_date',
				'status',
				'image',
				'mentor_id',
				'created_at',
				'meeting_info',
				/* ['meetingInfo.platform', 'meetingInfo.platform'],
				['meetingInfo.value', 'meetingInfo.value'], */
			],
			offset: limit * (page - 1),
			limit: limit,
			raw: true,
		})
		return sessionData
		return {
			data: sessionData.rows,
			count: sessionData.count,
		}
	} catch (error) {
		console.error(error)
		return error
	}
}

exports.findAndCountAll = async (filter, options = {}) => {
	try {
		const { rows, count } = await Session.findAndCountAll({
			where: filter,
			...options,
			raw: true,
		})
		return { rows, count }
	} catch (error) {
		return error
	}
}
exports.mentorsSessionWithPendingFeedback = async (mentorId, options = {}, completedSessionIds) => {
	try {
		return await Session.findAll({
			where: {
				id: { [Op.notIn]: completedSessionIds },
				status: 'COMPLETED',
				is_feedback_skipped: false,
				mentor_id: mentorId,
			},
			...options,
			raw: true,
		})
	} catch (error) {
		return error
	}
}
