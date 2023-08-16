const SessionAttendee = require('@database/models/index').SessionAttendee
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
		const [rowsAffected] = await SessionAttendee.update(update, {
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
