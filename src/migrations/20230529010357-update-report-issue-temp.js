var moment = require('moment')

let emailTemplate = {
	code: 'user_issue_reported',
	subject: 'Support request for MentorED-NEW',
	body: '<div><p>Hi Team,</p>{role} {name} is facing issue in <b>{description}</b>-{userEmailId} in 2.1 version of MentorED.<p>Kindly look into it.</p><p>Device name:{deviceName}</p><p>Android Version:{androidVersion}</p></div>',
	status: 'active',
	deleted: false,
	updatedAt: moment().format(),
	updatedBy: 'SYSTEM',
	emailFooter: 'email_footer',
	emailHeader: 'email_header',
}
let previousEmailTemplate = {
	code: 'user_issue_reported',
	subject: 'Support request for MentorED-OLD',
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
