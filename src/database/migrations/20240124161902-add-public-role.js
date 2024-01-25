'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		let rolesData = []

		const roleArray = ['user', 'mentor', 'mentee', 'org_admin', 'admin', 'manage_session', 'public']

		roleArray.forEach(function (role) {
			let user_type = 0
			if (['admin', 'org_admin', 'manage_session'].includes(role)) {
				user_type = 1
			}

			let eachRow = {
				title: role,
				user_type: user_type,
				visibility: 'PUBLIC',
				organization_id: defaultOrgId,
				updated_at: new Date(),
				created_at: new Date(),
			}

			rolesData.push(eachRow)
		})

		await queryInterface.bulkInsert('user_roles', rolesData, {})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete(
			'user_roles',
			roleArrayToDelete.map((role) => ({ title: role })),
			{}
		)
	},
}
