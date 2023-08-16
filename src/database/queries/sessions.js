const Session = require('@database/models/index').Session
const { Op } = require('sequelize')
const common = require('@constants/common')

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
			//start date less than or equals to startDate
			//end date greater than or equals to startDate

			query.start_date = {
				[Op.lte]: new Date(startDate),
			}
			query.end_date = {
				[Op.gte]: new Date(startDate),
			}

			if (sessionId) {
				// check if sessionId is truthy (i.e. not undefined or empty)
				console.log('came')
				query.id = { [Op.ne]: sessionId }
			}

			startDateResponse = await this.findAll(query)
		}
		if (endDate) {
			//start date less than or equals to endDate
			//end date greater than or equals to endDate
			query.start_date = {
				[Op.lte]: new Date(endDate),
			}
			query.end_date = {
				[Op.gte]: new Date(endDate),
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
