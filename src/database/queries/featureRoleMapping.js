/**
 * name : featureRoleMapping.js
 * author : Priyanka Pradeep
 * created-date : 02-Oct-2025
 * Description : feature-role-mapping database operations.
 */

const FeatureRoleMapping = require('@database/models/index').FeatureRoleMapping

module.exports = class FeatureRoleMappingQueries {
	/**
	 * Create feature role mapping.
	 * @method
	 * @name create
	 * @param {Object} data
	 * @returns {Promise<Object>}
	 */
	static async create(data) {
		try {
			const result = await FeatureRoleMapping.create(data, {
				returning: true,
				raw: true,
			})
			return result
		} catch (error) {
			throw error
		}
	}

	/**
	 * Bulk create feature role mappings.
	 * @method
	 * @name bulkCreate
	 * @param {Array} data
	 * @returns {Promise<Array>}
	 */
	static async bulkCreate(data) {
		try {
			const result = await FeatureRoleMapping.bulkCreate(data, {
				returning: true,
				raw: true,
			})
			return result
		} catch (error) {
			throw error
		}
	}

	/**
	 * Find feature role mappings by user roles with relations.
	 * @method
	 * @name findByRoles
	 * @param {Array} roles - Array of role titles
	 * @param {String} organizationCode
	 * @param {String} tenantCode
	 * @returns {Promise<Array>}
	 */
	static async findAll(filter, options = {}) {
		try {
			const result = await FeatureRoleMapping.findAll({
				where: filter,
				...options,
				raw: true,
			})
			return result
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete feature role mapping.
	 * @method
	 * @name delete
	 * @param {Object} filter
	 * @returns {Promise<Number>}
	 */
	static async delete(filter) {
		try {
			const result = await FeatureRoleMapping.destroy({
				where: filter,
			})
			return result
		} catch (error) {
			throw error
		}
	}
}
