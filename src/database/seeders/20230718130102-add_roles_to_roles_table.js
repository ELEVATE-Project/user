module.exports = {
	up: async (queryInterface, Sequelize) => {
		let rolesData = []
		const roleArray = ['user', 'mentor', 'mentee', 'admin']
		roleArray.forEach(async function (role) {
			let type = 'non_org'
			if (role == 'admin') {
				type = 'org'
			}

			let eachRow = {
				name: role,
				type: type,
				updated_at: new Date(),
				created_at: new Date(),
			}

			rolesData.push(eachRow)
		})
		await queryInterface.bulkInsert('roles', rolesData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('roles', null, {})
	},
}
