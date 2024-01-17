const SessionOwnership = require('@database/models/index').SessionOwnership

exports.create = async (data) => {
	try {
		return await SessionOwnership.create(data)
	} catch (error) {
		return error
	}
}
