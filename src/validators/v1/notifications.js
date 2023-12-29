/**
 * name : validators/v1/notifications.js
 * author : Vishnu
 * Date : 01-Oct-2023
 * Description : Validations of notification controller
 */

module.exports = {
	emailCronJob: (req) => {
		// Validate incoming request body
		req.checkBody('job_id').notEmpty().withMessage('job_id field is empty')
		req.checkBody('email_template_code').notEmpty().withMessage('email_template_code field is empty')
	},
}
