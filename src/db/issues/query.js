const Issues = require('./model')

module.exports = class issueData {
	static create(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let response = await new Issues(data).save()
				resolve(response)
			} catch (error) {
				reject(error)
			}
		})
	}
}
