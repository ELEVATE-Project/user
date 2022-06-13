const request = require('request')
const parser = require('xml2json')

var get = function (url, token = '', internal_access_token = false) {
	try {
		let headers = {
			'content-type': 'application/json',
		}
		if (internal_access_token) {
			headers['internal_access_token'] = process.env.INTERNAL_ACCESS_TOKEN
		}

		if (token) {
			headers['x-auth-token'] = token
		}

		const options = {
			headers: headers,
		}

		request.get(url, options, (err, data) => {
			let result = {
				success: true,
			}

			if (err) {
				result.success = false
			} else {
				let response = data.body
				if (data.headers['content-type'].split(';')[0] !== 'application/json') {
					response = parser.toJson(data.body)
				}

				response = JSON.parse(response)
				result.data = response
			}

			return result
		})
	} catch (error) {
		return error
	}
}

module.exports = {
	get: get,
}
