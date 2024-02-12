'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		const header = `<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='img_path' style='width:200px; max-width:100%; height:auto;' alt='MentorED' src='https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/email/image/emailLogo.png'></p><div style='text-align:left;'>`
		const footer = `</div><div style='margin-top:20px;text-align:left;'><div>Regards,</div><div>Team MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:left'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at support@shikshalokam.org</div></div></div></div>`

		const updateDataHeader = { body: header }
		const updateDataFooter = { body: footer }

		const updateFilterHeader = { code: 'email_header', organization_id: defaultOrgId }
		const updateFilterFooter = { code: 'email_footer', organization_id: defaultOrgId }

		await queryInterface.bulkUpdate('notification_templates', updateDataHeader, updateFilterHeader)
		await queryInterface.bulkUpdate('notification_templates', updateDataFooter, updateFilterFooter)
	},

	async down(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		const header = `<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='img_path' style='width:35%' alt='MentorED' src='https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/email/image/emailLogo.png'></p><div style='text-align:center'>`
		const footer = `</div><div style='margin-top:20px;text-align:center;'><div>Regards,</div><div>Team MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:center'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at support@shikshalokam.org</div></div></div></div>`

		const updateDataHeader = { body: header }
		const updateDataFooter = { body: footer }

		const updateFilterHeader = { code: 'email_header', organization_id: defaultOrgId }
		const updateFilterFooter = { code: 'email_footer', organization_id: defaultOrgId }

		await queryInterface.bulkUpdate('notification_templates', updateDataHeader, updateFilterHeader)
		await queryInterface.bulkUpdate('notification_templates', updateDataFooter, updateFilterFooter)
	},
}
