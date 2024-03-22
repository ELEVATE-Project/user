const { request, orgAdminLogIn, logError } = require('@commonTests')
const { faker } = require('@faker-js/faker')

const insertRequest = async () => {
	try {
		userDetails = await orgAdminLogIn()

		let res = await request
			.post('/user/v1/organization/requestOrgRole')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				role: 5,
				organization_id: 1,
				form_data: {
					designation: 'Manager',
					experience: '5 years',
					area_of_expertise: ['Finance', 'Management'],
					about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				},
			})

		logError(res)
		return [res.body, userDetails.token]
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertRequest,
}

//     roleRequestData = {
//         requester_id: userDetails.userId,
//         role: 2,
//         status: 'REQUESTED',
//         organization_id: userDetails.organization_id,
//         handled_by: null,
//         meta: {
//           designation: 'Manager',
//           experience: '5 years',
//           area_of_expertise: ['Finance', 'Management'],
//           about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
//         },
//         comments: ['Needs approval']
//       }
//         let createdReq = await OrganizationRoleRequests.create(roleRequestData)
//         return createdReq.get({ plain: true })
//       const result = await orgRoleReqQueries.create(roleRequestData)
//       console.log("result of  inserting request",result)
// return result
