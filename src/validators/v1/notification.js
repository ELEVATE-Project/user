/**
 * name : validators/v1/notification.js
 * author : Priyanka Pradeep
 * Date : 03-Nov-2023
 * Description : Validations of notification controller
 */
const filterRequestBody = require('../common')
const { notification } = require('@constants/blacklistConfig')
module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, notification.create)
		req.checkBody('type').trim().notEmpty().withMessage('type field is empty')

		req.checkBody('code').trim().notEmpty().withMessage('code field is empty')

		req.checkBody('subject').notEmpty().withMessage('subject field is empty')

		req.checkBody('body').notEmpty().withMessage('body field is empty')
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, notification.update)
		req.checkBody('type').trim().notEmpty().withMessage('type field is empty')

		req.checkBody('code').trim().notEmpty().withMessage('code field is empty')

		req.checkBody('subject').notEmpty().withMessage('subject field is empty')

		req.checkBody('body').notEmpty().withMessage('body field is empty')
	},

	read: (req) => {
		if (req.params.id || req.query.code) {
			if (req.params.id) {
				req.checkParams('id').notEmpty().withMessage('id param is empty')
			} else {
				req.checkQuery('code').notEmpty().withMessage('code field is empty')
			}
		}
	},
}
