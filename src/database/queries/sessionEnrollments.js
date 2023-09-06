const SessionEnrollment = require('@database/models/index').SessionEnrollment

exports.create = async (data) => {
	try {
		return await SessionEnrollment.create(data)
	} catch (error) {
		return error
	}
}

exports.unEnrollFromSession = async (sessionId, userId) => {
	try {
		const result = await SessionEnrollment.destroy({
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
