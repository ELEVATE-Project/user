const requestPromise = require(`request-promise-native`)
const correlator = require(`.correlation-id`)

module.exports = {
	requestPromise: requestPromise.defaults({
		headers: {
			get 'X-Request-Ids'() {
				return correlator.getId()
			},
		},
	}),
}
