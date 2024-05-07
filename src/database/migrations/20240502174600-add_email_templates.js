'use strict'

require('module-alias/register')
const moment = require('moment')
const fs = require('fs')
const path = require('path')
const request = require('request')
const common = require('@constants/common')
const fileService = require('@services/files')

async function uploadFile(filePath, uploadFilePath) {
	try {
		// Check if the file exists
		if (!fs.existsSync(filePath)) {
			throw new Error('The file does not exist in the folder: ' + filePath)
		}

		const uploadFolder = path.dirname(uploadFilePath)
		const uploadFileName = path.basename(uploadFilePath)

		// Get signed URL for uploading
		const signedUrlResult = await fileService.getSignedUrl(uploadFileName, '', uploadFolder, true)

		if (!signedUrlResult.result) {
			throw new Error('FAILED_TO_GENERATE_SIGNED_URL')
		}

		const fileUploadUrl = signedUrlResult.result.signedUrl
		const fileData = fs.readFileSync(filePath)

		// Upload file
		await request({
			url: fileUploadUrl,
			method: 'PUT',
			headers: {
				'x-ms-blob-type': common.azureBlobType,
				'Content-Type': 'multipart/form-data',
			},
			body: fileData,
		})

		console.log('File uploaded successfully')
		console.log('File path: ' + signedUrlResult.result.filePath)

		// Get downloadable URL
		const downloadableURL = await fileService.getDownloadableUrl(uploadFilePath, true)
		return downloadableURL.result
	} catch (error) {
		console.error('Error uploading file:', error)
		throw error
	}
}

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

			if (!defaultOrgId) {
				throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
			}

			// Path to the file to be uploaded
			const fileName = 'emailLogo.png'
			const filePath = path.join(__dirname, '../../assets', fileName)
			const uploadFilePath = 'assets/emailLogo.png'

			// Upload file
			const logoURL = await uploadFile(filePath, uploadFilePath)

			// Your email template data
			const emailTemplates = [
				{
					body: '<p>Dear {name},</p> Welcome to the {appName} community! We are excited for you to start your journey as a {roles}. <br><br> Login to {appName} to start your journey <br> Click here to login: <a href={portalURL}>{portalURL}</a>',
					code: 'registration',
					subject: 'MentorED - Registration Successful!',
				},
				{
					body: '<p>Dear {name},</p> Your OTP to reset your password is <strong>{otp}</strong>. Please enter the OTP to reset your password. For your security, please do not share this OTP with anyone.',
					code: 'emailotp',
					subject: 'MentorED - Reset Otp',
				},
				{
					body: '<div><p>Dear {name},</p> Your OTP to complete the registration process is <strong>{otp}</strong>. Please enter the OTP to complete the registration. For your security, please do not share this OTP with anyone.</div>',
					code: 'registrationotp',
					subject: 'Your OTP to sign-up on MentorED',
				},
				{
					body: '<div><p>Hi Team,</p>{role} {name} is facing an issue in <b>{description}</b>-{userEmailId} in version 2.1 of MentorED.</div>',
					code: 'user_issue_reported',
					subject: 'Support request for MentorED',
				},
				{
					body: `</div><div style='margin-top:20px;text-align:left;'><div>Regards,</div><div>Team MentorED</div><div style='margin-top:20px;color:#b13e33;text-align:left'><div>Note: Do not reply to this email. This email is sent from an unattended mailbox. Replies will not be read.</div><div>For any queries, please feel free to reach out to us at support@shikshalokam.org</div></div></div></div>`,
					code: 'email_footer',
					subject: null,
				},
				{
					body:
						"<div style='margin:auto;width:100%;max-width:650px;'><p style='text-align:center'><img class='img_path' style='width:200px; max-width:100%; height:auto;' alt='MentorED' src='" +
						logoURL +
						"'></p><div style='text-align:left;'>",
					code: 'email_header',
					subject: null,
				},
				{
					body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a mentor for {orgName}. Your expertise and willingness to share your knowledge will undoubtedly be a tremendous asset to our mentoring program.<br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a Mentor. <br><br> Click to register: {portalURL}',
					code: 'invite_mentor',
					subject: 'Welcome Aboard as a Mentor!',
				},
				{
					body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a mentee for {orgName}. You can now explore learning opportunities with our mentors. <br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a Mentee. <br><br> Click to register: {portalURL}',
					code: 'invite_mentee',
					subject: 'Welcome Aboard as a Mentee!',
				},
				{
					body: '<p>Dear {name},</p> PFA, status of your bulk upload activity by clicking on the <a href={inviteeUploadURL}>link</a>',
					code: 'invitee_upload_status',
					subject: 'Bulk upload Status',
				},
				{
					body: '<p>Dear {name},</p> We hope this message finds you in great spirits. We are pleased to inform you that your request to become a mentor for organisation {orgName} has been accepted. Your dedication and expertise make you a valuable addition to our mentorship community. Login to {appName} to start your journey as a mentor now. <br><br> Click here to login: {portalURL}',
					code: 'mentor_request_accepted',
					subject: 'MentorED - Congratulations! Your Mentor Request has been approved',
				},
				{
					body: '<p>Dear {name},</p> We hope this message finds you well. We appreciate your interest in becoming a mentor for {orgName} and the time you have invested in filling the form. After careful consideration, we regret to inform you that your request to become a mentor has not been successful at this time. Please know that this decision is not a reflection of your capabilities or qualifications. We encourage you to continue your engagement as a mentee on our platform.',
					code: 'mentor_request_rejected',
					subject: 'Mentor Request Update',
				},
				{
					body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a organization admin for {orgName}. You can now explore {appName}. <br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a organization admin. <br><br> Click to register: {portalURL}',
					code: 'invite_org_admin',
					subject: 'Welcome Aboard as a Organization Admin!',
				},
				{
					body: '<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a {roles} for {orgName}. <br>We request you to register on our Mentoring Platform (if not already), to start your journey with us as a {roles}. <br><br> Click to register: {portalURL}',
					code: 'generic_invite',
					subject: 'Welcome Aboard as a {roles}',
				},
			]
			// Check if email templates exist
			const existingTemplates = await queryInterface.sequelize.query(
				'SELECT code FROM notification_templates WHERE organization_id = :orgId',
				{
					replacements: { orgId: defaultOrgId },
					type: Sequelize.QueryTypes.SELECT,
				}
			)

			const newTemplates = emailTemplates.filter((template) => {
				return !existingTemplates.some((existingTemplate) => existingTemplate.code === template.code)
			})

			// Insert new email templates
			const notificationTemplateData = newTemplates.map((emailTemplate) => {
				emailTemplate['status'] = 'ACTIVE'
				emailTemplate['type'] = 'email'
				emailTemplate['updated_at'] = moment().format()
				emailTemplate['created_at'] = moment().format()
				emailTemplate['organization_id'] = defaultOrgId
				if (emailTemplate.code == 'email_footer') {
					emailTemplate['type'] = 'emailFooter'
				} else if (emailTemplate.code == 'email_header') {
					emailTemplate['type'] = 'emailHeader'
				} else {
					emailTemplate['email_footer'] = 'email_footer'
					emailTemplate['email_header'] = 'email_header'
				}
				return emailTemplate
			})
			if (notificationTemplateData.length != 0) {
				await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
			}

			const body = `<p>Dear {name},</p> Please find attached the status of your bulk upload activity.`
			const updateData = { body }

			const updateFilter = { code: 'invitee_upload_status', organization_id: defaultOrgId }
			await queryInterface.bulkUpdate('notification_templates', updateData, updateFilter)
		} catch (error) {
			console.log('Error:', error)
		}
	},

	down: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		await queryInterface.bulkDelete('notification_templates', { organization_id: defaultOrgId }, {})
	},
}
