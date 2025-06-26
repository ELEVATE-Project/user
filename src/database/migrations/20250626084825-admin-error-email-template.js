'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		const findOrgs = await queryInterface.sequelize.query(
			`SELECT id , tenant_code FROM organizations WHERE code = '${process.env.DEFAULT_ORGANISATION_CODE}'`
		)
		const bulkInsertPromise = findOrgs[0].map((data) => {
			return queryInterface.bulkInsert(
				'notification_templates',
				[
					{
						body: `<p>Dear {name},</p><p>We regret to inform you that the bulk user upload / invite process for onboarding users has failed due to the following error: {error}.</p><p>Please contact our support team for assistance.</p><p>We apologize for any inconvenience caused and appreciate your understanding.</p>`,
						subject: 'Failed Bulk User Upload / Invite for {orgName}',
						type: 'email',
						created_by: 0,
						updated_by: 0,
						code: 'invitee_upload_error',
						status: 'ACTIVE',
						email_header: 'email_header',
						email_footer: 'email_footer',
						organization_id: data.id,
						tenant_code: data.tenant_code,
						created_at: new Date(),
						updated_at: new Date(),
					},
				],
				{
					body: `Dear {name}, Sorry, the bulk user upload to onboard you as a {roles} for {orgName} failed due to: {error}. Please register manually at {portalURL} with code: {registerCode}. Contact support for help. Apologies for the inconvenience.`,
					type: 'sms',
					created_by: 0,
					updated_by: 0,
					code: 'invitee_upload_error',
					status: 'ACTIVE',
					organization_id: data.organization_id,
					tenant_code: data.tenant_code,
					created_at: new Date(),
					updated_at: new Date(),
				}
			)
		})

		await Promise.all(bulkInsertPromise)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('notification_templates', { code: 'invitee_upload_error' })
	},
}
