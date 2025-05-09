const publicService = require('@services/public')

module.exports = class Public {
	async branding(req) {
		const host = req.headers.origin || ''
		let domain = ''

		if (host) {
			try {
				const url = new URL(host)
				domain = url.hostname
			} catch (error) {
				domain = host.split(':')[0]
			}
		}
		try {
			return await publicService.tenantBranding(domain, req.query.org_code ? req.query.org_code : null)
		} catch (error) {
			return error
		}
	}
}
