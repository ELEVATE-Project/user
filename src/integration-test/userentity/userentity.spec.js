/**
 * name : userEntity.spec.js
 * author : Nevil
 * created-date : 28-Sep-2022
 * Description : Integration test for userEntity controllers.
 */

const { request, logIn, logError } = require('@commonTests')
const { faker } = require('@faker-js/faker')
const { insertEntity } = require('./userentityData')
const schema = require('./responseSchema')

describe('End point test for', function () {
	let userDetails
	let entityId

	beforeAll(async () => {
		userDetails = await logIn()
		entityId = await insertEntity()
	})

	it('creating user entity', async () => {
		let value = faker.random.alpha(5)

		let res = await request
			.post('/user/v1/userentity/create')
			.send({
				value: value,
				label: value,
				type: 'roles',
			})
			.set('X-auth-token', 'bearer ' + userDetails.token)

		logError(res)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createEntitySchema)
	})

	it('reading user entity', async () => {
		let res = await request
			.patch('/user/v1/userentity/read')
			.query({ type: 'roles', deleted: 'false', status: 'ACTIVE' })

		logError(res)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readEntitySchema)
	})
	it('updating user entity', async () => {
		let res = await request.patch('/user/v1/userentity/update/' + entityId).send({
			value: 'testUpdate',
		})

		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateEntitySchema)
	})
	it('deleting user entity', async () => {
		let res = await request.delete('/user/v1/userentity/delete/' + entityId)

		logError(res)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.deleteEntitySchema)
	})
	afterAll(async () => {
		//await deleteEntity()
	})
})
