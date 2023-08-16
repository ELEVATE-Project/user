module.exports = {
	up: async (queryInterface, Sequelize) => {
		let menteeData = []
		let mentorData = []
		const user = {
			mentor: [6, 7, 8, 9, 10],
			mentee: [1, 2, 3, 4, 5],
		}
		let designation = ['Teacher', 'HM', 'DEO']
		for (const role in user) {
			let userIds = user[role]
			if (role == 'mentee') {
				for (let i = 0; i < userIds.length; i++) {
					let defaultMentee = {
						user_id: userIds[i],
						designation: designation[Math.floor(Math.random() * designation.length)],
						area_of_expertise: ['eduLdship'],
						education_qualification: ['BEd'],
						user_type: role,
						organisation_ids: [1],
						updated_at: new Date(),
						created_at: new Date(),
					}
					menteeData.push(defaultMentee)
				}
			} else {
				for (let i = 0; i < userIds.length; i++) {
					let defaultMentor = {
						user_id: userIds[i],
						designation: designation[Math.floor(Math.random() * designation.length)],
						area_of_expertise: ['eduLdship'],
						education_qualification: ['BEd'],
						user_type: role,
						organisation_ids: [1],
						updated_at: new Date(),
						created_at: new Date(),
					}
					mentorData.push(defaultMentor)
				}
			}
		}

		await queryInterface.bulkInsert('user_extensions', menteeData, {})
		await queryInterface.bulkInsert('mentor_extensions', mentorData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('user_extensions', null, {})
		await queryInterface.bulkDelete('mentor_extensions', null, {})
	},
}
