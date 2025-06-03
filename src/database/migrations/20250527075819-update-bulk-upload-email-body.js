'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkUpdate(
			'notification_templates',
			{
				body: `<p>Dear {name},</p>
<p>Please find the status of your bulk upload activity. The output file is available as a CSV or via a downloadable link. Note that the downloadable link has an expiry, so please download it as soon as you receive this email.</p>
<p>Downloadable Link : {downloadLink}</a></p>`,
			},
			{
				code: 'invitee_upload_status',
			}
		)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkUpdate(
			'notification_templates',
			{
				body: `<p>Dear {name},</p> Please find attached the status of your bulk upload activity.`,
			},
			{
				code: 'invitee_upload_status',
			}
		)
	},
}
