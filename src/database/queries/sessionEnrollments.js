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
			force: true, // Setting force to true for a hard delete
		})

		return result
	} catch (error) {
		return error
	}
}
