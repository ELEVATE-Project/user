/**
 * name : validators/v1/notification.js
 * author : Priyanka Pradeep
 * Date : 03-Nov-2023
 * Description : Validations of notification controller
 */

module.exports = {
	create: (req) => {
		req.checkBody('type').trim().notEmpty().withMessage('type field is empty')

		req.checkBody('code').trim().notEmpty().withMessage('code field is empty')

		req.checkBody('subject').notEmpty().withMessage('subject field is empty')

		req.checkBody('body').notEmpty().withMessage('body field is empty')
	},

	update: (req) => {
		req.checkBody('type').trim().notEmpty().withMessage('type field is empty')

		req.checkBody('code').trim().notEmpty().withMessage('code field is empty')

		req.checkBody('subject').notEmpty().withMessage('subject field is empty')

		req.checkBody('body').notEmpty().withMessage('body field is empty')
	},

	read: (req) => {
		console.log(req.params.id, req.query.code, 'kjkkkkkkk')
		if (req.params.id || req.query.code) {
			if (req.params.id) {
				req.checkParams('id').notEmpty().withMessage('id param is empty')
			} else {
				req.checkQuery('code').notEmpty().withMessage('code field is empty')
			}
		}
	},
}
