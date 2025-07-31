/**
 * name : feature.js
 * author : Priyanka Pradeep
 * created-date : 09-Jun-2025
 * Description : Feature helper
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const featureQueries = require('@database/queries/feature')
const { UniqueConstraintError } = require('sequelize')
const { Op } = require('sequelize')
const responses = require('@helpers/responses')
const utilsHelper = require('@generics/utils')

module.exports = class featureHelper {
	/**
	 * Create feature.
	 * @method
	 * @name create
	 * @param {Object} bodyData - feature body data.
	 * @param {String} loggedInUserId - User id
	 * @returns {JSON} - feature created response.
	 */

	static async create(bodyData, loggedInUserId) {
		try {
			bodyData.created_by = loggedInUserId
			const feature = await featureQueries.create(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'FEATURE_CREATED_SUCCESSFULLY',
				result: feature,
			})
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				return responses.failureResponse({
					message: 'FEATURE_ALREADY_EXISTS',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			throw error
		}
	}

	/**
	 * Update feature.
	 * @method
	 * @name update
	 * @param {Object} bodyData - feature body data.
	 * @param {String} _id - feature id.
	 * @param {String} loggedInUserId - logged in user id.
	 * @returns {JSON} - feature updated response.
	 */

	static async update(code, bodyData, loggedInUserId) {
		try {
			bodyData.updated_by = loggedInUserId
			// Find the feature
			const existingFeature = await featureQueries.findByCode(code)
			if (!existingFeature) {
				return responses.failureResponse({
					message: 'FEATURE_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Update the feature
			const updatedFeature = await featureQueries.update(
				{
					code: code,
				},
				bodyData
			)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FEATURE_UPDATED_SUCCESSFULLY',
				result: updatedFeature,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Delete feature.
	 * @method
	 * @name delete
	 * @param {String} _id - Delete feature.
	 * @returns {JSON} - feature deleted response.
	 */

	static async delete(id) {
		try {
			// Check if the feature exists
			const existingFeature = await featureQueries.findByCode(id)
			if (!existingFeature?.code) {
				return responses.failureResponse({
					message: 'FEATURE_NOT_FOUND',
					statusCode: httpStatusCode.not_found,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Delete the feature
			await featureQueries.deleteByCode(id)

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FEATURE_DELETED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * list feature.
	 * @method
	 * @name list
	 * @param {String} id -  id.
	 * @returns {JSON} - modules list response.
	 */
	static async list(page, limit, search) {
		try {
			const offset = common.getPaginationOffset(page, limit)

			const filter = {
				code: { [Op.iLike]: `%${search}%` },
			}
			const options = {
				offset,
				limit,
				order: [['display_order', 'ASC']], // Sort by display_order in ascending order
			}
			const attributes = ['code', 'label', 'description', 'icon', 'meta', 'display_order']

			const features = await featureQueries.findAndCountAll(filter, attributes, options)

			if (features?.rows?.length === 0 || features?.count === 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'FEATURES_FETCHED_SUCCESSFULLY',
					result: { data: [], count: 0 },
				})
			}

			let data = features.rows

			await Promise.all(
				data.map(async (feature) => {
					if (feature.icon) {
						feature.icon = await utilsHelper.getDownloadableUrl(feature.icon)
					}
				})
			)

			const results = {
				data,
				count: features.count,
			}

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'FEATURES_FETCHED_SUCCESSFULLY',
				result: results,
			})
		} catch (error) {
			throw error
		}
	}
}
