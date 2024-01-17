const Issues = require('./model')

module.exports = class issueData {
	static async create(data) {
		try {
			let response = await new Issues(data).save()
			return response
		} catch (error) {
			return error
		}
	}
}
