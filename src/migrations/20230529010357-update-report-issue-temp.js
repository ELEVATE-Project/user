var moment = require('moment')

let emailTemplate = {
	code: 'user_issue_reported',
	subject: 'Support request for MentorED',
	body: '<div><p>Hi Team,</p><p>{role} {name}, is facing an issue in <b>{description}</b> -{userEmailId}.</p><p>Kindly look into it.</p><div style="background-color: #f5f5f5; padding: 10px; margin-top: 10px;"><p><b>Meta Information:</b></p><ul style="list-style-type: none; padding: 0;">{metaItems}</ul></div></div>',
	status: 'active',
	deleted: false,
	updatedAt: moment().format(),
	updatedBy: 'SYSTEM',
	emailFooter: 'email_footer',
	emailHeader: 'email_header',
}
let previousEmailTemplate = {
	code: 'user_issue_reported',
	subject: 'Support request for MentorED',
	body: '<div><p>Hi Team,</p>{role} {name} is facing issue in <b>{description}</b>-{userEmailId} in 2.1 version of MentorED.<p>Kindly look into it.</p><p>Device name:{deviceName}</p><p>Android Version:{androidVersion}</p></div>',
	status: 'active',
	deleted: false,
	updatedAt: moment().format(),
	updatedBy: 'SYSTEM',
	emailFooter: 'email_footer',
	emailHeader: 'email_header',
}
module.exports = {
	async up(db) {
		global.migrationMsg = 'update user issue reported template'

		await db.collection('notificationTemplates').updateOne({ code: 'user_issue_reported' }, { $set: emailTemplate })
	},

	async down(db) {
		await db
			.collection('notificationTemplates')
			.updateOne({ code: 'user_issue_reported' }, { $set: previousEmailTemplate })
	},
}
