const Issue = require('../models/index').Issue

module.exports = class issueData {
	static async create(data) {
		try {
			return await Issue.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}
}
