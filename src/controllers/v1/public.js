const publicService = require('@services/public')

module.exports = class Public {
	async branding(req) {
		const host = req.headers.origin || '' // e.g., 'http://localhost:3000' or undefined
		let domain = ''

		if (host) {
			try {
				const url = new URL(host)
				domain = url.hostname // e.g., 'localhost' or 'dev.elevate-mentoring.shikshalokam.org'
			} catch (error) {
				domain = host.split(':')[0] // Fallback: remove port if present
			}
		}
		try {
			return await publicService.tenantBranding(domain, req.query.org_code ? req.query.org_code : null)
		} catch (error) {
			return error
		}
	}
}
