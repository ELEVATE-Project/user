const publicService = require('@services/public')

module.exports = class Public {
	async branding(req) {
		const host = req.headers.host // e.g., 'tenant1.example.com'
		const domain = host.split(':')[0] // in case there's a port

		try {
			return await publicService.tenantBranding(domain, req.query.org_code ? req.query.org_code : null)
		} catch (error) {
			return error
		}
	}
}
