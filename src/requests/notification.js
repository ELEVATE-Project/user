const axios = require('axios')

const DEFAULT_NOTIFICATION_URL = process.env.NOTIFICATION_API_URL

/**
 * Sends email and/or SMS using the notification API.
 *
 * @param {Object} payload - The email and SMS content.
 * @param {Object} options - Optional overrides (like API URL).
 * @returns {Promise<Object>} - API response or error.
 *
 * @example
 * sendNotification({
 *   email: {
 *     to: ['example@example.com'],
 *     subject: 'Hello!',
 *     body: '<p>Welcome!</p>'
 *   },
 *   sms: {
 *     to: ['9876543210'],
 *     body: 'Thanks for joining!'
 *   }
 * });
 */
async function sendNotification(payload, options = {}) {
	const url = options.url || DEFAULT_NOTIFICATION_URL

	if (!payload.email && !payload.sms) {
		throw new Error('Payload must include at least one of email or sms')
	}

	try {
		const response = await axios.post(url, payload, {
			headers: {
				'Content-Type': 'application/json',
			},
		})
		return response.data
	} catch (err) {
		console.error('Error sending notification:', err.message)
		throw err
	}
}

module.exports = {
	sendNotification,
}
