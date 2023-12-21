/**
 * name : entity.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Entity Controller.
 */

// Dependencies
const entityService = require('@services/entity')

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
			const createdEntity = await entityService.create(params, req.decodedToken.id)
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
			const updatedEntity = await entityService.update(params, id, req.decodedToken.id)
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
			if (req.query.id || req.query.value) {
				return await entityService.read(req.query, req.decodedToken.id)
			}
			return await entityService.readAll(req.query, req.decodedToken.id)
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
		try {
			const updatedEntity = await entityService.delete(req.params.id, req.decodedToken.id)
			return updatedEntity
		} catch (error) {
			return error
		}
	}
}
