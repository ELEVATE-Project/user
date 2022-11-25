let emailTemplates = [
	{
		code: 'user_issue_reported',
		subject: 'Support request for MentorED',
		body: '<div><p>Hi Team,</p>{role} {name} is facing issue in <b>{description}</b>-{userEmailId} in 2.1 version of MentorED.<p>Kindly look into it.</p><p>Device name:{deviceName}</p><p>Android Version:{androidVersion}</p></div>',
	},
]
var moment = require('moment')

module.exports = {
	async up(db) {
		global.migrationMsg = 'Uploaded email templates'
		let notificationTemplateData = []
		emailTemplates.forEach(async function (emailTemplate) {
			emailTemplate['status'] = 'active'
			emailTemplate['deleted'] = false
			emailTemplate['type'] = 'email'
			emailTemplate['updatedAt'] = moment().format()
			emailTemplate['createdAt'] = moment().format()
			emailTemplate['createdBy'] = 'SYSTEM'
			emailTemplate['updatedBy'] = 'SYSTEM'
			if (emailTemplate.code == 'email_footer') {
				emailTemplate['type'] = 'emailFooter'
			} else if (emailTemplate.code == 'email_header') {
				emailTemplate['type'] = 'emailHeader'
			} else {
				emailTemplate['emailFooter'] = 'email_footer'
				emailTemplate['emailHeader'] = 'email_header'
			}
			notificationTemplateData.push(emailTemplate)
		})
		await db.collection('notificationTemplates').insertMany(notificationTemplateData)
	},

	async down(db) {
		db.collection('notificationTemplates').deleteMany({
			code: { $in: emailTemplates.map((emailTemplate) => emailTemplate.code) },
		})
	},
}
