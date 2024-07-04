/**
 * name : entity.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Entity Controller.
 */

// Dependencies
const entityService = require('@services/entities')

module.exports = class Entity {
	/**
	 * create entity
	 * @method
	 * @name create
	 * @param {Object} req - request data.
	 * @returns {JSON} - entities creation object.
	 */

	async create(req) {
		try {
			const createdEntity = await entityService.create(req.body, req.decodedToken.id, req.decodedToken.roles)
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
		try {
			const updatedEntity = await entityService.update(
				req.body,
				req.params.id,
				req.decodedToken.id,
				req.decodedToken.roles
			)
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
			return await entityService.readAll(req.query, null)
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
	/**
	 * entity list
	 * @method
	 * @name list
	 * @param {Object} req - request data.
	 * @returns {JSON} - entities.
	 */
	async list(req) {
		try {
			return await entityService.list(req.query, req.searchText, req.pageNo, req.pageSize)
		} catch (error) {
			return error
		}
	}
}
