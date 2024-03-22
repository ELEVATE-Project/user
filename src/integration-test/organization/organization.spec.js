const { request, logError, orgAdminLogIn, adminLogIn } = require('@commonTests')
let responseSchema = require('./responseSchema')
const { faker } = require('@faker-js/faker')
const { insertOrganization } = require('./organizationData')
//const { requestDetails } = require('@database/queries/orgRoleRequest')

describe('/user/v1/organization', function () {
	let userDetails
	beforeAll(async () => {
		userDetails = await orgAdminLogIn()
		adminDetails = await adminLogIn()
		insertOrg = await insertOrganization()
	})

	it('/create', async () => {
		let res = await request
			.post('/user/v1/organization/create')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				name: faker.random.alpha(5),
				code: faker.random.alpha(5),
				description: 'testing org',
				domains: ['cc.com'],
			})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(responseSchema.createSchema)
	})

	it('/read', async () => {
		let res = await request
			.get('/user/v1/organization/read')
			.set({
				internal_access_token: 'internal_access_token',
				// Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.query({ organisation_id: 1, organisation_code: 'default' })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(responseSchema.readSchema)
	})

	it('/update', async () => {
		console.log(insertOrg[0].result.id)
		let res = await request
			.patch('/user/v1/organization/update/' + insertOrg[0].result.id)
			.set({
				'X-auth-token': 'bearer ' + insertOrg[1],
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				name: faker.random.alpha(5),
				description: 'testing org',
				related_orgs: [3, 4],
			})

		logError(res)
		expect(res.statusCode).toBe(202)
		console.log(res.body)
		expect(res.body).toMatchSchema(responseSchema.updateSchema)
	})
})
