/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const entityData = require('./entityData')
const schema = require('./responseSchema')

describe('mentoring/v1/entity', function () {
	beforeAll(async () => {
		await commonHelper.logIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/entity/create').send({
			value: faker.random.alpha(5),
			label: faker.random.alpha(5),
			type: faker.random.alpha(5),
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createEntitySchema)
	})
	it('/read', async () => {
		let res = await request.get('/mentoring/v1/entity/read').query({ type: 'categories' })

		//console.log(res.body)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readEntitySchema)
	})
	it('/update', async () => {
		let entityId = await entityData.insertEntity()
		let res = await request.post('/mentoring/v1/entity/update/' + entityId).send({
			value: faker.random.alpha(5),
			label: faker.random.alpha(5),
			type: faker.random.alpha(5),
			status: 'ACTIVE',
		})
		//console.log(res.body)
		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateEntitySchema)
	})
})
