const correlator = require(`./correlation-id`)

function correlationIdMiddleware(req, res, next) {
	correlator.bindEmitter(req)
	correlator.bindEmitter(res)
	correlator.bindEmitter(req.socket)

	correlator.withId(() => {
		const currentCorrelationId = correlator.getId()
		res.set(`X-Request-Ids`, currentCorrelationId)
		next()
	}, req.get(`X-Request-Ids`))
}

module.exports = { correlationIdMiddleware }
