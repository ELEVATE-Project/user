// Dependencies
const entityTypeService = require('@services/entity-type')

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
			return await entityTypeService.create(req.body, req.decodedToken.id, req.decodedToken.organization_id)
		} catch (error) {
			return error
		}
	}

	/**
	 * updates entity
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - entities updating response.
	 */

	async update(req) {
		try {
			return await entityTypeService.update(
				req.body,
				req.params.id,
				req.decodedToken.id,
				req.decodedToken.organization_id
			)
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
			if (req.body.value) {
				return await entityTypeService.readUserEntityTypes(
					req.body,
					req.decodedToken.id,
					req.decodedToken.organization_id
				)
			}
			return await entityTypeService.readAllSystemEntityTypes(req.decodedToken.organization_id)
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
			return await entityTypeService.delete(req.params.id, req.decodedToken.organization_id)
		} catch (error) {
			return error
		}
	}
}
