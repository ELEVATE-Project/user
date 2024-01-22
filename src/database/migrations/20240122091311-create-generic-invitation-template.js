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
				code: 'generic_invite',
				subject: 'Welcome Aboard as a {roles}',
				body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a {roles} for {orgName}. You can now explore {appName}. <br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a organization admin. <br><br> Click to register: {portalURL}',
				status: 'ACTIVE',
				type: 'email',
				created_at: moment().format(),
				updated_at: moment().format(),
				email_header: 'email_header',
				email_footer: 'email_footer',
				organization_id: defaultOrgId,
			},
		]

		await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('notification_templates', { code: 'generic_invite' })
	},
}
