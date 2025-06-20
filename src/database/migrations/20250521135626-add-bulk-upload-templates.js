'use strict'
const moment = require('moment')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		const now = moment().format()

		let notificationTemplateData = [
			{
				code: 'bulk_user_create',
				body: `Hi {name}, you’ve been onboarded as a {roles} at {orgName}. Login at {portalURL} Username: {username} and update your password after the first login for security. Please reach out to your company administrator for your password.`,
				status: 'ACTIVE',
				type: 'sms',
				created_at: now,
				updated_at: now,
				organization_id: defaultOrgId,
				tenant_code: process.env.DEFAULT_TENANT_CODE,
			},
			{
				code: 'bulk_user_create',
				body: `<p>Dear {name}, You have been successfully onboarded as a <strong>{roles}</strong> for <strong>{orgName}</strong>. Your username is <strong>{username}</strong>. Please reach out to your company administrator for your password. Login at <a href="{portalURL}">{portalURL}</a> and update your password after the first login for security.</p>`,
				status: 'ACTIVE',
				type: 'email',
				email_header: 'email_header',
				email_footer: 'email_footer',
				created_at: now,
				updated_at: now,
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
					[Op.in]: ['bulk_user_create'],
				},
			},
			{}
		)
	},
}
