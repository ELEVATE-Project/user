'use strict'
const moment = require('moment')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		let notificationTemplateData = [
			{
				body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a {roles} for {orgName}. <br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a {roles}. <br><br> Click to register: {portalURL}',
				updated_at: moment().format(),
			},
		]

		await queryInterface.bulkUpdate('notification_templates', notificationTemplateData[0], {
			code: 'generic_invite',
		})
	},

	down: async (queryInterface, Sequelize) => {
		let notificationTemplateData = [
			{
				body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a {roles} for {orgName}. You can now explore {appName}. <br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a organization admin. <br><br> Click to register: {portalURL}',
				updated_at: moment().format(),
			},
		]

		await queryInterface.bulkUpdate('notification_templates', notificationTemplateData[0], {
			code: 'generic_invite',
		})
	},
}
