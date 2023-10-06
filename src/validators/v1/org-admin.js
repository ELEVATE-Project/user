/**
 * name : validators/v1/org-admin.js
 * author : Vishnu
 * Date : 05-Oct-2023
 * Description : Validations of org-admin controller
 */

module.exports = {
	roleChange: (req) => {
		// Validate incoming request body
		req.checkBody('user_id').notEmpty().withMessage('user_id field is empty')
		req.checkBody('current_roles').notEmpty().withMessage('current_roles field is empty')
		req.checkBody('new_roles').notEmpty().withMessage('new_roles field is empty')
	},
}
