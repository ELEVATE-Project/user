const correlationId = require(`./correlation-id`)
const winston = require(`winston`)

function createLogger(opts = {}) {
	const { level = `info`, getCorrelationId, noCorrelationIdValue = `nocorrelation` } = opts

	return winston.createLogger({
		format: winston.format.combine(
			winston.format((info) => {
				info.correlationId = getCorrelationId() || noCorrelationIdValue
				return info
			})(),
			winston.format.timestamp(),
			winston.format.errors({ stack: true }),

			winston.format.printf(({ timestamp, correlationId, level, message }) => {
				console.log(message)
				return `${timestamp} (${correlationId}) - ${level}: ${JSON.stringify(message)}`
			})
		),
		level,
		transports: [
			// new winston.transports.Console({
			// 	handleExceptions: true,
			// }),
			new winston.transports.File({
				filename: 'user.log',
				format: winston.format.combine(
					winston.format((info) => {
						info.correlationId = getCorrelationId() || noCorrelationIdValue
						return info
					})(),
					winston.format.timestamp(),
					winston.format.errors({ stack: true }),
					winston.format.printf(({ timestamp, correlationId, level, message }) => {
						return `${timestamp} (${correlationId}) - ${level}: ${JSON.stringify(message)}`
					})
				),
			}),
		],
		exitOnError: false,
	})
}

const logger = createLogger({
	getCorrelationId: correlationId.getId,
})
module.exports = { logger }
