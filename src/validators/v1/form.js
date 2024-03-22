/**
 * name : validators/v1/form.js
 * author : Aman Gupta
 * Date : 03-Nov-2021
 * Description : Validations of forms controller
 */
const filterRequestBody = require('../common')
const { form } = require('@constants/blacklistConfig')

module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, form.create)
		req.checkBody('type')
			.trim()
			.notEmpty()
			.withMessage('type field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('type is invalid')

		req.checkBody('sub_type')
			.trim()
			.notEmpty()
			.withMessage('sub_type field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('sub_type is invalid')

		req.checkBody('data').notEmpty().withMessage('data field is empty')

		req.checkBody('data.template_name')
			.trim()
			.notEmpty()
			.withMessage('template_name field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('template_name is invalid, must be string')

		req.checkBody('data.fields').notEmpty().withMessage('fields field is empty')
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, form.update)
		req.checkBody('type')
			.notEmpty()
			.withMessage('type field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('type is invalid')

		req.checkBody('sub_type')
			.trim()
			.notEmpty()
			.withMessage('sub_type field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('sub_type is invalid')

		req.checkBody('data.template_name')
			.notEmpty()
			.withMessage('data.template_name field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('template_name is invalid')
			.custom((value) => {
				if (!req.body.data.fields) {
					throw new Error('fields key is not passed while passing data.templateName')
				}
				return true
			})

		req.checkBody('data.fields')
			.optional()
			.custom((value) => {
				if (!req.body.data.template_name) {
					throw new Error('template_name key is not passed while updating data.fields')
				}
				return true
			})
	},

	read: (req) => {
		if (req.params.id || Object.keys(req.body).length !== 0) {
			if (req.params.id) {
				req.checkParams('id').notEmpty().withMessage('id param is empty')
			} else {
				req.checkBody('type')
					.trim()
					.notEmpty()
					.withMessage('type field is empty')
					.matches(/^[A-Za-z]+$/)
					.withMessage('type is invalid')

				req.checkBody('sub_type')
					.trim()
					.notEmpty()
					.withMessage('sub_type field is empty')
					.matches(/^[A-Za-z]+$/)
					.withMessage('sub_type is invalid')
			}
		}
	},
}
