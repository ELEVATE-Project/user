/**
 * name : validators/v1/entity-type.js
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Validations of user entities controller
 */
const filterRequestBody = require('../common')
const { entityType } = require('@constants/blacklistConfig')
module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, entityType.create)
		req.checkBody('value')
			.trim()
			.notEmpty()
			.withMessage('value field is empty')
			.matches(/^[A-Za-z_]+$/)
			.withMessage('value is invalid, must not contain spaces')

		req.checkBody('label')
			.trim()
			.notEmpty()
			.withMessage('label field is empty')
			.matches(/^[A-Za-z0-9 ]+$/)
			.withMessage('label is invalid')

		req.checkBody('data_type')
			.trim()
			.notEmpty()
			.withMessage('data_type field is empty')
			.matches(/^[A-Za-z\[\]]+$/)
			.withMessage('data_type is invalid, must not contain spaces')

		req.checkBody('model_names')
			.isArray()
			.notEmpty()
			.withMessage('model_names must be an array with at least one element')

		req.checkBody('model_names.*').isIn(['User']).withMessage('model_names must be User')

		req.checkBody('allow_filtering').optional().isEmpty().withMessage('allow_filtering is not allowed in create')
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, entityType.update)
		req.checkParams('id').notEmpty().withMessage('id param is empty')

		req.checkBody('value')
			.optional()
			.matches(/^[A-Za-z]+$/)
			.withMessage('value is invalid, must not contain spaces')

		req.checkBody('label')
			.optional()
			.matches(/^[A-Za-z0-9 ]+$/)
			.withMessage('label is invalid')

		req.checkBody('status')
			.optional()
			.matches(/^[A-Z]+$/)
			.withMessage('status is invalid, must be in all caps')

		req.checkBody('data_type')
			.trim()
			.notEmpty()
			.withMessage('data_type field is empty')
			.matches(/^[A-Za-z\[\]]+$/)
			.withMessage('data_type is invalid, must not contain spaces')

		req.checkBody('model_names')
			.isArray()
			.notEmpty()
			.withMessage('model_names must be an array with at least one element')

		req.checkBody('model_names.*')
		isIn(['User']).withMessage('model_names must be in User')
	},

	read: (req) => {
		if (req.query.type) {
			req.checkQuery('type')
				.trim()
				.notEmpty()
				.withMessage('type field is empty')
				.matches(/^[A-Za-z]+$/)
				.withMessage('type is invalid, must not contain spaces')

			req.checkQuery('deleted').optional().isBoolean().withMessage('deleted is invalid')

			req.checkQuery('status')
				.optional()
				.trim()
				.matches(/^[A-Z]+$/)
				.withMessage('status is invalid, must be in all caps')
		}
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
