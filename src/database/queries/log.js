const Log = require('../models/index').Log

module.exports = class UserEntityData {
	static async createLog(data) {
		try {
			return await Log.create(data)
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
