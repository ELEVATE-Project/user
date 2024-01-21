const organizationService = require('@services/organization')

module.exports = class Organization {
	async update(req) {
		try {
			return await organizationService.update(req.body, req.decodedToken)
		} catch (error) {
			return error
		}
	}

	async create(req) {
		try {
			return await organizationService.create(req.query.organizationId, req.query.creatorId)
		} catch (error) {
			throw error
		}
	}
}
