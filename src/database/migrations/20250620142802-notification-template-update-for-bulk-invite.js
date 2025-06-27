'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkUpdate(
			'notification_templates',
			{
				body: `<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a {roles} for {orgName}. <br>We request you to register on our Platform (if not already), to start your journey with us as a {roles}. <br><br> Click to register: {portalURL}<br><br> register code: {registerCode}`,
			},
			{
				code: 'generic_invite',
			}
		)
		const generic_invite = await queryInterface.sequelize.query(
			"SELECT organization_id , tenant_code FROM notification_templates WHERE code = 'generic_invite'"
		)
		const bulkInsertPromise = generic_invite[0].map((data) => {
			return queryInterface.bulkInsert(
				'notification_templates',
				[
					{
						body: 'Dear {name}, You’ve been invited to join {orgName} as a {roles}! Please register on our platform using code {registerCode} OR {portalURL}',
						type: 'sms',
						created_by: 0,
						updated_by: 0,
						code: 'generic_invite',
						status: 'ACTIVE',
						organization_id: data.organization_id,
						tenant_code: data.tenant_code,
						created_at: new Date(),
						updated_at: new Date(),
					},
				],
				{}
			)
		})

		await Promise.all(bulkInsertPromise)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkUpdate(
			'notification_templates',
			{
				body: `<p>Dear {name},</p> We are delighted to inform you that you have been successfully onboarded as a {roles} for {orgName}. <br>We request you to register on our Platform (if not already), to start your journey with us as a {roles}. <br><br> Click to register: {portalURL}`,
			},
			{
				code: 'generic_invite',
			}
		)
		await queryInterface.bulkDelete('notification_templates', { code: 'generic_invite', type: 'sms' })
	},
}
