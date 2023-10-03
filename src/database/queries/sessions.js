const Session = require('@database/models/index').Session
const { Op, literal } = require('sequelize')
const common = require('@constants/common')
const sequelize = require('sequelize')

const moment = require('moment')
const SessionOwnership = require('../models/index').SessionOwnership

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
		console.log(error)
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
		console.log(error)
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
exports.getAllUpcomingSessions = async () => {
	//const currentEpochTime = moment().unix()
	const currentEpochTime = moment().format('YYYY-MM-DD HH:mm:ssZ')

	try {
		return await Session.findAll({
			paranoid: false,
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
