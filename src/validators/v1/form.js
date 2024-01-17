/**
 * name : validators/v1/form.js
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Validations of forms controller
 */

module.exports = {
	create: (req) => {
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
			.withMessage('subType is invalid')

		req.checkBody('data').notEmpty().withMessage('data field is empty')
	},

	update: (req) => {
		req.checkBody('type')
			.notEmpty()
			.withMessage('type field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('type is invalid')

		req.checkBody('sub_type')
			.notEmpty()
			.withMessage('sub_type field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('sub_type is invalid')
	},

	read: (req) => {
		if (req.params.id || Object.keys(req.body).length !== 0) {
			if (req.params.id) {
				req.checkParams('id')
					.notEmpty()
					.withMessage('id param is empty')
					.isNumeric()
					.withMessage('id is invalid')
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
