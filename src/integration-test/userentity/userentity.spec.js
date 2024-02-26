/**
 * name : userEntity.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for userEntity controllers.
 */

const { request, adminLogIn, logError } = require('@commonTests')
const { faker } = require('@faker-js/faker')
const { insertEntity } = require('./userentityData')
const schema = require('./responseSchema')

describe('End point test for', function () {
	let userDetails
	let entityId

	beforeAll(async () => {
		userDetails = await adminLogIn()
		entityId = await insertEntity()
	})

	it('/create', async () => {
		let value = faker.random.alpha(5)

		let res = await request
			.post('/user/v1/entity/create')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				value: faker.random.alpha(5),
				label: faker.random.alpha(5),
				status: 'ACTIVE',
				type: 'roles',
				entity_type_id: 1,
			})

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createEntitySchema)
	})

	it('/read', async () => {
		let res = await request
			.patch('/user/v1/entity/read')
			.set({
				'X-auth-token': 'bearer ' + userDetails.token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.query({ type: 'roles', deleted: 'false', status: 'ACTIVE' })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readEntitySchema)
	})

	it('/update', async () => {
		let res = await request
			.post('/user/v1/entity/update/' + entityId[0])
			.set({
				'X-auth-token': 'bearer ' + entityId[1],
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			})
			.send({
				value: faker.random.alpha(5),
				label: 'acycz',
				status: 'ACTIVE',
				type: 'roles',
				entity_type_id: 1,
			})

		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateEntitySchema)
	})
	it('/delete', async () => {
		let res = await request.delete('/user/v1/entity/delete/' + entityId[0]).set({
			'X-auth-token': 'bearer ' + entityId[1],
			Connection: 'keep-alive',
			'Content-Type': 'application/json',
		})

		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.deleteEntitySchema)
	})
	afterAll(async () => {
		//await deleteEntity()
	})
})
