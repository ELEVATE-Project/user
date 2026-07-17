/**
 * name : validators/v1/accounts.js
 * author : Aman Gupta
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
 */
const common = require('@constants/common')
const filterRequestBody = require('../common')
const { tenant } = require('@constants/blacklistConfig')

const parseObject = (value) => {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value)
		} catch (e) {
			return false
		}
	}

	return value
}

const isPlainObject = (value) => {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isValidObject = (value) => {
	return isPlainObject(parseObject(value))
}

const isValidTenantConfiguration = (value) => {
	const configuration = parseObject(value)
	const allowedAuthModes = Object.values(common.AUTH_MODES)

	return (
		isPlainObject(configuration) &&
		Array.isArray(configuration.allowed_auth_mode) &&
		configuration.allowed_auth_mode.length > 0 &&
		configuration.allowed_auth_mode.every((authMode) => allowedAuthModes.includes(authMode)) &&
		typeof configuration.auto_register === 'boolean'
	)
}

const normalizeTenantConfiguration = (req) => {
	if (req.body.configuration === '') {
		delete req.body.configuration
		return
	}

	if (typeof req.body.configuration === 'string') {
		const configuration = parseObject(req.body.configuration)
		if (configuration) req.body.configuration = configuration
	}
}

module.exports = {
	update: (req) => {
		if (req.params.id) {
			req.body = filterRequestBody(req.body, tenant.update)
			normalizeTenantConfiguration(req)
			req.checkParams('id')
				.trim()
				.notEmpty()
				.withMessage('code param is empty')
				.matches(/^[a-zA-Z0-9_]+$/)
				.withMessage('Code must contain only letters, numbers, and underscores')

			req.checkBody('configuration')
				.optional({ checkFalsy: true })
				.custom(isValidTenantConfiguration)
				.withMessage('Configuration must include allowed_auth_mode, and auto_register')
		} else {
			req.body = filterRequestBody(req.body, tenant.create)
			normalizeTenantConfiguration(req)

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
				.custom(isValidObject)
				.withMessage('Theming must be a valid object or a JSON string representing an object')

			req.checkBody('configuration')
				.optional({ checkFalsy: true })
				.custom(isValidTenantConfiguration)
				.withMessage('Configuration must include allowed_auth_mode, and auto_register')

			req.checkBody('meta')
				.optional({ checkFalsy: true })
				.custom(isValidObject)
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

	bulkUserCreate: (req) => {
		req.body = filterRequestBody(req.body, tenant.bulkUserCreate)
		const allowedTypes = [common.TYPE_INVITE, common.TYPE_UPLOAD]
		req.checkBody('file_path').trim().notEmpty().withMessage('file_path key is empty')
		req.checkBody('upload_type')
			.notEmpty()
			.withMessage('upload_type is required')
			.custom((value) => allowedTypes.includes(value.toUpperCase()))
			.withMessage(`upload_type must be one of: ${allowedTypes.join(', ')}`)
	},
}
