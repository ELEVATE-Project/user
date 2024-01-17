/**
 * name : validators/v1/mentees.js
 * author : Aman Gupta
 * Date : 19-Nov-2021
 * Description : Validations of mentees controller
 */

module.exports = {
	forms: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
	submit: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
