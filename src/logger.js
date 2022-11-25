var { createLogger, transports, format } = require('winston')
const correlator = require('express-correlation-id')
const logFormat = format.printf((info) => {
	console.log(info)
	let message = {
		timestamp: info.timestamp,
		level: info.level,
		message: info,
	}
	return JSON.stringify(message)
	// }`${info.timestamp} ${info.level} ${info.coralation_id} ${info.message}`
})

var logger = createLogger({
	// defaultMeta: { correlator.getId()},
	format: format.combine(
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		// Format the metadata object
		format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
	),
	level: 'debug',
	transports: [
		new transports.Console({
			format: format.combine(format.colorize(), logFormat),
		}),
		new transports.File({
			filename: 'user.log',

			format: format.combine(logFormat),
		}),
	],
})

module.exports = logger
