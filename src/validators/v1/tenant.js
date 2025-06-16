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
			req.checkParams('id')
				.trim()
				.notEmpty()
				.withMessage('code param is empty')
				.matches(/^[a-zA-Z0-9_]+$/)
				.withMessage('Code must contain only letters, numbers, and underscores')
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

	addDomain: (req) => {
		req.body = filterRequestBody(req.body, tenant.addDomain)
		req.checkParams('id')
			.trim()
			.notEmpty()
			.withMessage('code param is empty')
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage('Code must contain only letters, numbers, and underscores')
		req.checkBody('domains')
			.custom((value) => {
				// Allow arrays directly
				if (Array.isArray(value)) {
					if (value.length <= 0) return false
					return true
				}
				// Allow strings, optionally parsing JSON
				if (typeof value === 'string') {
					if (value == '') return false
					return true
				}
				// Reject all other types (e.g., objects, numbers, null)
				return false
			})
			.withMessage(
				'Domains must be a non-empty array or a non-empty string (multiple domains can be added comma separated)'
			)
	},

	removeDomain: (req) => {
		req.body = filterRequestBody(req.body, tenant.removeDomain)
		req.checkParams('id')
			.trim()
			.notEmpty()
			.withMessage('code param is empty')
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage('Code must contain only letters, numbers, and underscores')
		req.checkBody('domains')
			.custom((value) => {
				// Allow arrays directly
				if (Array.isArray(value)) {
					if (value.length <= 0) return false
					return true
				}
				// Allow strings, optionally parsing JSON
				if (typeof value === 'string') {
					if (value == '') return false
					return true
				}
				// Reject all other types (e.g., objects, numbers, null)
				return false
			})
			.withMessage(
				'Domains must be a non-empty array or a non-empty string (multiple domains can be added comma separated)'
			)
	},

	userBulkUpload: (req) => {
		req.body = filterRequestBody(req.body, tenant.userBulkUpload)
		const allowedTypes = [common.TYPE_INVITE, common.TYPE_UPLOAD]
		req.checkBody('file_path').trim().notEmpty().withMessage('file_path key is empty')
		req.checkBody('upload_type')
			.notEmpty()
			.withMessage('upload_type is required')
			.custom((value) => allowedTypes.includes(value.toUpperCase()))
			.withMessage(`upload_type must be one of: ${allowedTypes.join(', ')}`)
	},
}
