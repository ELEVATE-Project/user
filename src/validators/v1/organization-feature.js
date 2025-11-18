/**
 * name : validators/v1/orgnization-feature.js
 * author : Vishnu
 * Date : 17-May-2025
 * Description : Validations of orgnization-feature controller
 */
const filterRequestBody = require('../common')
const { organizationFeatures } = require('@constants/blacklistConfig')
const common = require('@constants/common')
module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, organizationFeatures.create)
		req.checkBody('feature_code').trim().notEmpty().withMessage('feature_code field is empty')
		req.checkBody('feature_name').trim().notEmpty().withMessage('feature_name field is empty')
		req.checkBody('display_order')
			.notEmpty()
			.withMessage('display_order must not be empty')
			.matches(/^\d+$/)
			.withMessage('display_order must contain only digits')
	},
	update: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
		if (req.method != common.DELETE_METHOD) {
			req.body = filterRequestBody(req.body, organizationFeatures.update)
			req.checkBody('feature_name').trim().notEmpty().withMessage('feature_name field is empty')
			req.checkBody('display_order')
				.optional()
				.matches(/^\d+$/)
				.withMessage('display_order must contain only digits')
		}
	},

	read: (req) => {
		if (req.params.id) {
			req.checkParams('id').notEmpty().withMessage('id param is empty')
		}
	},
}
