/**
 * name : validators/userCreateCommonValidation.js
 * Description : Shared common profile field validation used across
 *                account/tenant/user validators - name, and the optional
 *                has_accepted_terms_and_conditions/languages/image fields.
 */
module.exports = function userCreateCommonValidation(req) {
	req.checkBody('name')
		.trim()
		.notEmpty()
		.withMessage('name field is empty')
		.matches(/^[A-Za-z ]+$/)
		.withMessage('This field can only contain alphabets')

	req.checkBody('has_accepted_terms_and_conditions')
		.optional()
		.isBoolean()
		.withMessage('has_accepted_terms_and_conditions field is invalid')
	req.checkBody('languages').optional().isArray().withMessage('languages is invalid')
	req.checkBody('image').optional().isString().withMessage('image field must be string only')
}
