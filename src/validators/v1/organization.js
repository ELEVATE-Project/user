/**
 * name : validators/v1/admin.js
 * author : Priyanka Pradeep
 * Date : 25-July-2023
 * Description : Validations of Organization controller
 */
const filterRequestBody = require('../common')
const { organization } = require('@constants/blacklistConfig')
const utilsHelper = require('@generics/utils')
const common = require('@constants/common')

module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, organization.create)
		req.checkBody('code')
			.trim()
			.notEmpty()
			.withMessage('code field is empty')
			.matches(/^[a-z0-9_]+$/)
			.withMessage('code is invalid. Only lowercase alphanumeric characters allowed')
		req.checkBody('tenant_code').trim().notEmpty().withMessage('tenant_code field is empty')
		req.checkBody('registration_codes')
			.optional({ checkFalsy: true })
			.trim()
			.withMessage('registration_codes must filled, if not required - remove the key')
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('name is invalid')

		req.checkBody('description')
			.trim()
			.notEmpty()
			.withMessage('description field is empty')
			.matches(/^[a-zA-Z0-9\-.,\s]+$/)
			.withMessage('invalid description')
		req.checkBody('domains').trim().notEmpty().withMessage('domains field is empty')
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, organization.update)
		req.checkParams('id').notEmpty().withMessage('id param is empty')
		req.checkBody('name')
			.optional()
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('name is invalid')

		req.checkBody('description')
			.optional()
			.trim()
			.notEmpty()
			.withMessage('description field is empty')
			.matches(/^[a-zA-Z0-9\-.,\s]+$/)
			.withMessage('invalid description')
	},

	requestOrgRole: (req) => {
		req.body = filterRequestBody(req.body, organization.requestOrgRole)
		req.checkBody('role').notEmpty().withMessage('role field is empty')
		req.checkBody('form_data').notEmpty().withMessage('form_data field is empty')
		req.checkBody('form_data.about')
			.optional()
			.trim()
			.notEmpty()
			.withMessage('about field is empty')
			.matches(/^[a-zA-Z0-9\-.,\s]+$/)
			.withMessage('invalid about')
		req.checkBody('form_data.experience')
			.optional()
			.trim()
			.notEmpty()
			.withMessage('form_data.experience field is empty')
			.isNumeric()
			.withMessage('invalid form_data.experience')
	},

	read: (req) => {
		req.checkQuery('organisation_id').optional().notEmpty().withMessage('organisation_id field is empty')

		req.checkQuery('organisation_code').optional().notEmpty().withMessage('organisation_code field is empty')

		// Use oneOf to check that at least one of the fields is present
		req.checkQuery()
			.oneOf(['organisation_id', 'organisation_code'])
			.withMessage('At least one of organisation_id or organisation_code should be present')
	},

	addRegistrationCode: (req) => {
		const isAdmin = utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)
		req.checkParams('id').notEmpty().withMessage('code param is empty')

		if (isAdmin) {
			req.checkBody('tenant_code').notEmpty().withMessage('tenant_code field is empty')
		}

		req.checkBody('registration_codes')
			.notEmpty()
			.withMessage('registration_codes field is empty')
			.custom((value) => {
				if (!Array.isArray(value)) {
					throw new Error('registration_codes must be an array')
				}
				if (value.length === 0) {
					throw new Error('registration_codes array cannot be empty')
				}
				return true
			})

		req.checkBody('registration_codes.*')
			.optional()
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage('Each registration code must be alphanumeric with underscores only')
	},
	removeRegistrationCode: (req) => {
		const isAdmin = utilsHelper.validateRoleAccess(req.decodedToken.roles, common.ADMIN_ROLE)
		req.checkParams('id').notEmpty().withMessage('code param is empty')

		if (isAdmin) {
			req.checkBody('tenant_code').notEmpty().withMessage('tenant_code field is empty')
		}

		req.checkBody('registration_codes')
			.notEmpty()
			.withMessage('registration_codes field is empty')
			.custom((value) => {
				if (!Array.isArray(value)) {
					throw new Error('registration_codes must be an array')
				}
				if (value.length === 0) {
					throw new Error('registration_codes array cannot be empty')
				}
				return true
			})

		req.checkBody('registration_codes.*')
			.optional()
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage('Each registration code must be alphanumeric with underscores only')
	},
}
