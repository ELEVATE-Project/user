/**
 * name : userService.js.
 * author : Aman Karki.
 * created-date : 17-Dec-2021.
 * Description : User service health check functionality.
 */

// Dependencies
const request = require('request')

/**
 * User service health check.
 * @function
 * @name health_check
 * @returns {Boolean} - true/false.
 */

async function health_check() {
	try {
		let healthCheckUrl = process.env.USER_SERVICE_HOST + '/healthCheckStatus'

		const options = {
			headers: {
				'content-type': 'application/json',
			},
		}

		request.get(healthCheckUrl, options, (err, data) => {
			let result = false

			if (err) {
				result = false
			} else {
				let response = JSON.parse(data.body)
				if (response.status === 200) {
					result = true
				} else {
					result = false
				}
			}
			return result
		})
	} catch (error) {
		return error
	}
}

module.exports = {
	health_check: health_check,
}
