/**
 * name : validators/v1/entity.js
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Validations of user entities controller
 */

module.exports = {
	create: (req) => {
		req.checkBody('value')
			.trim()
			.notEmpty()
			.withMessage('value field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('value is invalid, must not contain spaces')

		req.checkBody('label')
			.trim()
			.notEmpty()
			.withMessage('label field is empty')
			.matches(/^[A-Za-z0-9 ]+$/)
			.withMessage('label is invalid')

		req.checkBody('entity_type_id')
			.notEmpty()
			.withMessage('entity_type_id field is empty')
			.isNumeric()
			.withMessage('entity_type_id is invalid, must be numeric')
	},

	update: (req) => {
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

		req.checkBody('deleted').optional().isBoolean().withMessage('deleted is invalid')

		req.checkBody('type')
			.optional()
			.matches(/^[A-Za-z]+$/)
			.withMessage('type is invalid, must not contain spaces')
	},

	read: (req) => {
		req.checkQuery('id')
			.trim()
			.optional()
			.notEmpty()
			.withMessage('id param is empty')
			.isNumeric()
			.withMessage('id param is invalid, must be an integer')

		req.checkQuery('value')
			.trim()
			.optional()
			.notEmpty()
			.withMessage('value field is empty')
			.matches(/^[A-Za-z0-9 ]+$/)
			.withMessage('value is invalid, must not contain spaces')
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
