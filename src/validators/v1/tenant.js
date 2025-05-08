/**
 * name : validators/v1/accounts.js
 * author : Aman Gupta
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
 */
const common = require('@constants/common')
const filterRequestBody = require('../common')
const { tenant } = require('@constants/blacklistConfig')

module.exports = {
	update: (req) => {
		if (req.params.id) {
			req.body = filterRequestBody(req.body, tenant.update)
		} else {
			req.body = filterRequestBody(req.body, tenant.create)

			req.checkBody('name').trim().notEmpty().withMessage('name field is empty')

			req.checkBody('code')
				.trim()
				.notEmpty()
				.withMessage('Code field is empty')
				.matches(/^[a-zA-Z0-9_]+$/)
				.withMessage('Code must contain only letters, numbers, and underscores')

			req.checkBody('description').trim()

			req.checkBody('logo').trim()

			req.checkBody('theming')
				.optional({ checkFalsy: true })
				.custom((value) => {
					// If value is a string, try parsing it as JSON
					if (typeof value === 'string') {
						try {
							const parsed = JSON.parse(value)
							return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
						} catch (e) {
							return false
						}
					}
					// If value is not a string, check if it’s a plain object
					return typeof value === 'object' && value !== null && !Array.isArray(value)
				})
				.withMessage('Theming must be a valid object or a JSON string representing an object')

			req.checkBody('meta')
				.optional({ checkFalsy: true })
				.custom((value) => {
					// If value is a string, try parsing it as JSON
					if (typeof value === 'string') {
						try {
							const parsed = JSON.parse(value)
							return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
						} catch (e) {
							return false
						}
					}
					// If value is not a string, check if it’s a plain object
					return typeof value === 'object' && value !== null && !Array.isArray(value)
				})
				.withMessage('Meta must be a valid object or a JSON string representing an object')

			req.checkBody('domains').trim().notEmpty().withMessage('domains field is empty')
		}
	},
}
