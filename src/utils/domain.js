function getDomainFromRequest(req) {
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

	return domain
}

module.exports = {
	getDomainFromRequest,
}
