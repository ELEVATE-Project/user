const Session = require('../models/index').Session

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

		if (rowsAffected > 0) {
			return 'ENTITY_UPDATED'
		} else {
			return 'ENTITY_NOT_FOUND'
		}
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
