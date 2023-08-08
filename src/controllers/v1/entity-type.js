/**
 * name : entity.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Entity Controller.
 */

// Dependencies
const entityTypeHelper = require('@services/helper/entityType')

module.exports = class Entity {
	/**
	 * create entity type
	 * @method
	 * @name create
	 * @param {Object} req - request data.
	 * @returns {JSON} - entity type creation object.
	 */

	async create(req) {
		try {
			return await entityTypeHelper.create(req.body, req.decodedToken.id, req.decodedToken.roles)
		} catch (error) {
			return error
		}
	}

	/**
	 * updates entity type
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - entity type updation response.
	 */

	async update(req) {
		try {
			return await entityTypeHelper.update(req.body, req.params.id, req.decodedToken.id, req.decodedToken.roles)
		} catch (error) {
			return error
		}
	}

	/**
	 * reads entity types
	 * @method
	 * @name read
	 * @param {Object} req - request data.
	 * @returns {JSON} - entity types.
	 */

	async read(req) {
		try {
			if (req.body.read_user_entity) {
				return await entityTypeHelper.readUserEntityTypes(req.body, req.decodedToken.id)
			}
			return await entityTypeHelper.readAllSystemEntityTypes()
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
			return await entityTypeHelper.delete(req.params.id)
		} catch (error) {
			return error
		}
	}
}
