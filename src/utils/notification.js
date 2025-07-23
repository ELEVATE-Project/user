const kafkaCommunication = require('@generics/kafka-communication')
const utilsHelper = require('@generics/utils')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')

const NOTIFICATION_MODE = process.env.NOTIFICATION_MODE

const { sendNotification } = require('../requests/notification')
const common = require('@constants/common')

async function sendEmailNotification({ emailId, templateCode, variables, tenantCode, organization_code = '' }) {
	try {
		if (!emailId) return

		const templateData =
			(await notificationTemplateQueries.findOneEmailTemplate(templateCode, organization_code, tenantCode)) || {}
		if (Object.keys(templateData).length <= 0) {
			console.warn(`Email template not found for code: ${templateCode}`)
			return
		}

		const emailPayload = {
			email: {
				to: Array.isArray(emailId) ? emailId : [emailId],
				subject: utilsHelper.composeEmailBody(templateData.subject, variables),
				body: utilsHelper.composeEmailBody(templateData.body, variables),
			},
		}

		if (NOTIFICATION_MODE === 'kafka') {
			await kafkaCommunication.pushEmailToKafka({
				type: common.notificationEmailType,
				...emailPayload,
			})
		} else {
			await sendNotification(emailPayload)
		}

		return {
			success: true,
		}
	} catch (err) {
		console.error('sendEmailNotification error:', err)
		return {
			success: false,
			error: err,
		}
	}
}

async function sendSMSNotification({ phoneNumber, templateCode, variables, tenantCode, organization_code = '' }) {
	try {
		if (!phoneNumber) return

		const templateData = await notificationTemplateQueries.findOneSMSTemplate(
			templateCode,
			organization_code,
			tenantCode
		)
		if (!templateData) {
			console.warn(`SMS template not found for code: ${templateCode}`)
			return
		}

		const smsBody = utilsHelper.composeEmailBody(templateData.body, variables)
		const smsPayload = {
			sms: {
				to: Array.isArray(phoneNumber) ? phoneNumber : [phoneNumber],
				body: smsBody,
			},
		}

		if (NOTIFICATION_MODE === 'kafka') {
			await kafkaCommunication.pushEmailToKafka({ type: common.notificationSMSType, ...smsPayload })
		} else {
			await sendNotification(smsPayload)
		}

		return {
			success: true,
		}
	} catch (err) {
		console.error('sendSMSNotification error:', err)
		return {
			success: false,
			error: err,
		}
	}
}

module.exports = {
	sendEmailNotification,
	sendSMSNotification,
}
