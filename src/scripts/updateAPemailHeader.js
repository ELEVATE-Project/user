const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env' })
require('../configs/mongodb')()
const NotificationTemplate = require('../db/notification-template/model')

const updateNotificationTemplate = async (code, newBody) => {
	try {
		const filter = { code }
		const update = { body: newBody }
		const options = { new: true }
		const updatedDoc = await NotificationTemplate.findOneAndUpdate(filter, update, options)

		if (!updatedDoc) {
			console.log('Document not found')
		} else {
			console.log('Updated document:', updatedDoc)
		}
	} catch (error) {
		console.error('Error updating the document:', error)
	} finally {
		mongoose.disconnect()
	}
}

const newBodyContent =
	"<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='imgPath' style='width:35%' alt='MentorED' src='https://ap-mentoring-prod-storage.s3.ap-south-1.amazonaws.com/public/emailLogo.png'></p><div style='text-align:center'>"
updateNotificationTemplate('email_header', newBodyContent)
