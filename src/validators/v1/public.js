/**
 * name : validators/v1/public.js
 * Description : Validations of public controller
 */
module.exports = {
	checkUsername: (req) => {
		req.checkQuery('username').trim().notEmpty().withMessage('username field is empty')
	},
}
