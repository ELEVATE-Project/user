'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const registrationTemplate = await queryInterface.sequelize.query(
			`SELECT * FROM notification_templates WHERE code = :code AND organization_id = :organization_id LIMIT 1`,
			{
				replacements: {
					code: process.env.REGISTRATION_EMAIL_TEMPLATE_CODE,
					organization_id: defaultOrgId,
				},
				type: Sequelize.QueryTypes.SELECT,
			}
		)

		if (registrationTemplate) {
			const update = await queryInterface.sequelize.query(
				`UPDATE notification_templates SET body = :body WHERE code = :code AND organization_id = :organization_id`,
				{
					replacements: {
						code: process.env.REGISTRATION_EMAIL_TEMPLATE_CODE,
						organization_id: defaultOrgId,
						body: '<p>Dear {name},</p> Welcome to the {appName} community! We are excited for you to start your journey as a {roles}. <br><br> Login to {appName} to start your journey <br> Click here to login: <a href={portalURL}>{portalURL}</a>',
					},
					type: Sequelize.QueryTypes.UPDATE,
				}
			)
			console.log(update, 'update')
		} else {
			console.log('Registration template not found')
		}
	},

	down: async (queryInterface, Sequelize) => {
		//not required
	},
}
