'use strict'
const moment = require('moment')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		let notificationTemplateData = [
			{
				code: 'registrationotp',
				body: 'Your {app_name} OTP for registration is {otp}. Please do not share this OTP with anyone.',
				status: 'ACTIVE',
				type: 'sms',
				created_at: moment().format(),
				updated_at: moment().format(),
				organization_id: defaultOrgId,
				tenant_code: process.env.DEFAULT_TENANT_CODE,
			},
			{
				code: 'emailotp',
				body: 'Your {app_name} OTP to reset your password is {otp}. Please do not share this OTP with anyone.',
				status: 'ACTIVE',
				type: 'sms',
				created_at: moment().format(),
				updated_at: moment().format(),
				organization_id: defaultOrgId,
				tenant_code: process.env.DEFAULT_TENANT_CODE,
			},
			{
				code: 'registration',
				body: `Welcome to {appName}! You're now registered as a {roles}. Start your journey here: {portalURL}`,
				status: 'ACTIVE',
				type: 'sms',
				created_at: moment().format(),
				updated_at: moment().format(),
				organization_id: defaultOrgId,
				tenant_code: process.env.DEFAULT_TENANT_CODE,
			},
		]

		await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
	},

	down: async (queryInterface, Sequelize) => {
		const Op = Sequelize.Op
		await queryInterface.bulkDelete(
			'notification_templates',
			{
				code: {
					[Op.in]: ['registrationotp', 'emailotp', 'registration'],
				},
				type: 'sms',
			},
			{}
		)
	},
}
