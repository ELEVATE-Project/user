const Issues = require('./model')

module.exports = class issueData {
	static create(data) {
		return new Promise(async (resolve, reject) => {
			try {
				await new Issues(data).save()
				resolve(true)
			} catch (error) {
				reject(error)
			}
		})
	}
}
