const publicService = require('@services/public')
const { getDomainFromRequest } = require('@utils/domain')

module.exports = class Public {
	async branding(req) {
		const domain = getDomainFromRequest(req)
		let tenantCode = ''
		if (domain == '') {
			tenantCode = req?.headers?.tenant
		}

		try {
			return await publicService.tenantBranding(
				domain,
				req.query.org_code ? req.query.org_code : null,
				tenantCode ? tenantCode : null
			)
		} catch (error) {
			return error
		}
	}

	async checkUsername(req) {
		const domain = getDomainFromRequest(req)

		try {
			return await publicService.checkUsername(req.query.username, domain)
		} catch (error) {
			return error
		}
	}
}
