/**
 * name : entity.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Entity Controller.
 */

// Dependencies
const entityHelper = require('@services/helper/entity')

module.exports = class Entity {
	/**
	 * create entity
	 * @method
	 * @name create
	 * @param {Object} req - request data.
	 * @returns {JSON} - entities creation object.
	 */

	async create(req) {
		const params = req.body
		try {
			const createdEntity = await entityHelper.create(params, req.decodedToken._id)
			return createdEntity
		} catch (error) {
			return error
		}
	}

	/**
	 * updates entity
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - entities updation response.
	 */

	async update(req) {
		const params = req.body
		const id = req.params.id
		try {
			const updatedEntity = await entityHelper.update(params, id, req.decodedToken._id)
			return updatedEntity
		} catch (error) {
			return error
		}
	}

	/**
	 * reads entities
	 * @method
	 * @name read
	 * @param {Object} req - request data.
	 * @returns {JSON} - entities.
	 */

	async read(req) {
		try {
			if (req.body.readUserEntity) {
				return await entityHelper.readUserEntity(req.body, req.decodedToken._id)
			}
			return await entityHelper.read(req.body)
		} catch (error) {
			return error
		}
	}

	/**
	 * deletes entity
	 * @method
	 * @name delete
	 * @param {Object} req - request data.
	 * @returns {JSON} - entities deletion response.
	 */

	async delete(req) {
		const _id = req.params.id
		try {
			const updatedEntity = await entityHelper.delete(_id)
			return updatedEntity
		} catch (error) {
			return error
		}
	}
}
