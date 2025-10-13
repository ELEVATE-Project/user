const publicService = require('@services/public')
const { getDomainFromRequest } = require('@utils/domain')
const common = require('@constants/common')

module.exports = class Public {
	async branding(req) {
		let domain = ''
		let tenantCode = req?.headers?.[common.TENANT_CODE_HEADER] || null
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
		try {
			return await publicService.userInvites(req.query.invitation_key, req.body.tenant_code)
		} catch (error) {
			return error
		}
	}
}
