const { request, logError, orgAdminLogIn } = require('@commonTests')
let responseSchema = require('./responseSchema')
const { faker } = require('@faker-js/faker')
const { insertRequest } = require('./orgAdminData')
//const { requestDetails } = require('@database/queries/orgRoleRequest')

describe('/user/v1/org-admin', function () {
	let userDetails
	let randomFilePath

	beforeAll(async () => {
		userDetails = await orgAdminLogIn()
		const generateRandomFilePath = () => {
			const randomFileName = faker.system.fileName()
			return `${randomFileName}.csv`
		}
		randomFilePath = generateRandomFilePath()
	})

	it('/bulkUserCreate', async () => {
		let res = await request
			.post('/user/v1/org-admin/bulkUserCreate')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				file_path: randomFilePath,
			})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.bulkUserCreateSchema)
	})

	it('/getBulkInvitesFilesList', async () => {
		let res = await request
			.get('/user/v1/org-admin/getBulkInvitesFilesList')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.query({ page: 1, limit: 10, status: 'REQUESTED' })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.getBulkInvitesFilesListSchema)
	})

	it('/getRequestDetails', async () => {
		let requestDetails = await insertRequest()
		//console.log(requestDetails[0].meta.formsVersion)
		let res = await request.get('/user/v1/org-admin/getRequestDetails/' + requestDetails[0].result.id).set({
			'X-auth-token': 'bearer ' + requestDetails[1],
			Connection: 'keep-alive',
			'Content-Type': 'application/json',
		})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.getRequestDetailsSchema)
	})

	it('/getRequests', async () => {
		let requestDetails = await insertRequest()
		let res = await request
			.post('/user/v1/org-admin/getRequests')
			.set({
				'X-auth-token': 'bearer ' + requestDetails[1],
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({ filters: { role: requestDetails[0].result.role, status: ['REQUESTED'] } })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.getRequestsSchema)
	})

	it('/updateRequestStatus', async () => {
		let requestDetails = await insertRequest()
		let res = await request
			.post('/user/v1/org-admin/updateRequestStatus')
			.set({
				'X-auth-token': 'bearer ' + requestDetails[1],
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				request_id: requestDetails[0].result.id,
				comments: ['All uploaded documents verified', 'Profile information verified'],
				status: 'APPROVED',
			})

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.updateRequestStatusSchema)
	})

	it('/deactivateUser', async () => {
		let requestDetails = await insertRequest()
		console.log(requestDetails)
		let res = await request
			.post('/user/v1/org-admin/deactivateUser')
			.set({
				'X-auth-token': 'bearer ' + requestDetails[1],
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				id: [requestDetails[0].result.requester_id],
			})

		logError(res)
		expect(res.statusCode).toBe(200)
		console.log(res.body)
		expect(res.body).toMatchSchema(responseSchema.deactivateUserSchema)
	})

	// need to get understanding for below api , where it is there for user service

	// it('/inheritEntityType', async () => {
	// 	let requestDetails = await insertRequest()
	// 	console.log(requestDetails[0].result.meta)
	// 	let res = await request
	// 		.post('/user/v1/org-admin/inheritEntityType')
	// 		.set({
	// 			'X-auth-token': 'bearer ' + requestDetails[1],
	// 			Connection: 'keep-alive',
	// 			'Content-Type': 'application/json',
	// 		})
	// 		.send({
	// 			entity_type_value: 'categories',
	// 			target_entity_type_label: 'training'
	// 		})

	// 	logError(res)
	// 	expect(res.statusCode).toBe(200)
	// 	console.log(res.body)
	// 	expect(res.body).toMatchSchema(responseSchema.deactivateUserSchema)
	// })
})
