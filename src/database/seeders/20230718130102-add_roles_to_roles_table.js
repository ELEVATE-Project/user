module.exports = {
	up: async (queryInterface, Sequelize) => {
		let rolesData = []
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		const roleArray = ['user', 'mentor', 'mentee', 'admin']
		roleArray.forEach(async function (role) {
			let user_type = 0
			if (role == 'admin') {
				user_type = 1
			}
			let eachRow = {
				title: role,
				user_type: user_type,
				updated_at: new Date(),
				created_at: new Date(),
			}

			rolesData.push(eachRow)
		})
		await queryInterface.bulkInsert('user_roles', rolesData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('user_roles', null, {})
	},
}
