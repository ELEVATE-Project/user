/**
 * name : validators/v1/notifications.js
 * author : Vishnu
 * Date : 01-Oct-2023
 * Description : Validations of notification controller
 */

module.exports = {
	emailCronJob: (req) => {
		// Validate incoming request body
		req.checkBody('jobId').notEmpty().withMessage('jobId field is empty')
		req.checkBody('emailTemplateCode').notEmpty().withMessage('emailTemplateCode field is empty')
	},
}
