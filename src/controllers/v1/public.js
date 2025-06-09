const publicService = require('@services/public')
const { getDomainFromRequest } = require('@utils/domain')

module.exports = class Public {
	async branding(req) {
		let domain = ''
		let tenantCode = req?.headers?.tenantid || null
		if (!tenantCode) {
			domain = getDomainFromRequest(req)
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

	async userInvites(req) {
		const domain = getDomainFromRequest(req)

		try {
			return await publicService.userInvites(req.query.invitation_key, domain)
		} catch (error) {
			return error
		}
	}
}
