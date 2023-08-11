const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const organizationQueries = require('@database/queries/organization')
const utils = require('@generics/utils')

module.exports = class OrganizationsHelper {
	/**
	 * Create Organization.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Organization creation data.
	 */

	static async create(bodyData) {
		try {
			let organization = await organizationQueries.findOne({ code: bodyData.code })

			if (organization) {
				return common.failureResponse({
					message: 'ORGANIZATION_ALREADY_EXISTS',
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			}

			let createOrg = await organizationQueries.create(bodyData)
			const cacheKey = common.redisOrgPrefix + createOrg.id.toString()
			await utils.internalDel(cacheKey)
			// await KafkaProducer.clearInternalCache(cacheKey)
			let result = {
				organization: createOrg,
			}

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ORGANIZATION_CREATED_SUCCESSFULLY',
				createOrg,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update Organization
	 * @method
	 * @name update
	 * @param {Object} bodyData
	 * @returns {JSON} - Update Organization data.
	 */

	static async update(id, bodyData) {
		try {
			const rowsUpdated = await organizationQueries.update({ id: id }, bodyData)
			if (rowsUpdated == 0) {
				return common.failureResponse({
					message: 'ORGANIZATION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const cacheKey = common.redisOrgPrefix + id.toString()
			await utils.internalDel(cacheKey)
			// await KafkaProducer.clearInternalCache(cacheKey)
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'ORGANIZATION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * List Organizations.
	 * @method
	 * @name list
	 * @param {Object} bodyData
	 * @returns {JSON} - Organization data.
	 */

	static async list(params) {
		try {
			if (params.hasOwnProperty('body') && params.body.hasOwnProperty('organizationIds')) {
				const organizationIds = params.body.organizationIds
				const orgIdsNotFoundInRedis = []
				const orgDetailsFoundInRedis = []
				for (let i = 0; i < organizationIds.length; i++) {
					let orgDetails =
						(await utils.redisGet(common.redisOrgPrefix + organizationIds[i].toString())) || false

					if (!orgDetails) {
						orgIdsNotFoundInRedis.push(organizationIds[i])
					} else {
						orgDetailsFoundInRedis.push(orgDetails)
					}
				}

				let options = {
					attributes: ['id', 'name', 'code', 'description'],
				}

				let organizations = await organizationQueries.findAll(
					{
						id: orgIdsNotFoundInRedis,
					},
					options
				)

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
					result: [...organizations, ...orgDetailsFoundInRedis],
				})
			} else {
				let organizations = await organizationQueries.listOrganizations(
					params.pageNo,
					params.pageSize,
					params.searchText
				)

				if (organizations.rows.length < 1) {
					return common.successResponse({
						statusCode: httpStatusCode.ok,
						message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
						result: {
							data: [],
							count: 0,
						},
					})
				}

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'ORGANIZATION_FETCHED_SUCCESSFULLY',
					result: {
						data: organizations.rows,
						count: organizations.count,
					},
				})
			}
		} catch (error) {
			throw error
		}
	}
}
