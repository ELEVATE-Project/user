/**
 * name : validators/v1/organisation.js
 * author : Rakesh Kumar
 * Date : 14-01-2021
 * Description : Validations of organisation controller
 */

module.exports = {
	create: (req) => {
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('name is invalid, must not contain spaces')

		req.checkBody('code')
			.trim()
			.notEmpty()
			.withMessage('code field is empty')
			.matches(/^[A-Za-z0-9 ]+$/)
			.withMessage('code is invalid')

		req.checkBody('description')
			.trim()
			.notEmpty()
			.withMessage('description field is empty')
			.matches(/^[A-Za-z0-9]+$/)
			.withMessage('description is invalid, must not contain spaces')
	},

	update: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty').isMongoId().withMessage('id is invalid')

		req.checkBody('name')
			.trim()
			.optional()
			.withMessage('name is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('name is invalid, must not contain spaces')

		req.checkBody('code')
			.trim()
			.optional()
			.withMessage('code field is empty')
			.matches(/^[A-Za-z0-9 ]+$/)
			.withMessage('code is invalid')

		req.checkBody('description')
			.trim()
			.optional()
			.withMessage('description field is empty')
			.matches(/^[A-Za-z]+$/)
			.withMessage('description is invalid, must not contain spaces')
	},

	details: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty').isMongoId().withMessage('id is invalid')
	},

	delete: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty').isMongoId().withMessage('id is invalid')
	},
}
