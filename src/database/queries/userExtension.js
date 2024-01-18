const MenteeExtension = require('../models/index').UserExtension
const { QueryTypes } = require('sequelize')
const sequelize = require('sequelize')
const Sequelize = require('@database/models/index').sequelize
const common = require('@constants/common')
const _ = require('lodash')

module.exports = class MenteeExtensionQueries {
	static async getColumns() {
		try {
			return await Object.keys(MenteeExtension.rawAttributes)
		} catch (error) {
			return error
		}
	}

	static async getModelName() {
		try {
			return await MenteeExtension.name
		} catch (error) {
			return error
		}
	}
	static async createMenteeExtension(data) {
		try {
			return await MenteeExtension.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async updateMenteeExtension(userId, data, options = {}, customFilter = {}) {
		try {
			if (data.user_id) {
				delete data['user_id']
			}
			const whereClause = _.isEmpty(customFilter) ? { user_id: userId } : customFilter
			return await MenteeExtension.update(data, {
				where: whereClause,
				...options,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async getMenteeExtension(userId, attributes = []) {
		try {
			const queryOptions = {
				where: { user_id: userId },
				raw: true,
			}
			// If attributes are passed update query
			if (attributes.length > 0) {
				queryOptions.attributes = attributes
			}
			const mentee = await MenteeExtension.findOne(queryOptions)
			return mentee
		} catch (error) {
			throw error
		}
	}

	static async deleteMenteeExtension(userId, force = false) {
		try {
			const options = { where: { user_id: userId } }

			if (force) {
				options.force = true
			}
			return await MenteeExtension.destroy(options)
		} catch (error) {
			throw error
		}
	}
	static async removeMenteeDetails(userId) {
		try {
			return await MenteeExtension.update(
				{
					designation: null,
					area_of_expertise: [],
					education_qualification: null,
					rating: null,
					meta: null,
					stats: null,
					tags: [],
					configs: null,
					visibility: null,
					visible_to_organizations: [],
					external_session_visibility: null,
					external_mentor_visibility: null,
					deleted_at: Date.now(),
				},
				{
					where: {
						user_id: userId,
					},
				}
			)
		} catch (error) {
			console.error('An error occurred:', error)
			throw error
		}
	}
	static async getUsersByUserIds(ids, options = {}) {
		try {
			const result = await MenteeExtension.findAll({
				where: {
					user_id: ids, // Assuming "user_id" is the field you want to match
				},
				...options,
				returning: true,
				raw: true,
			})

			return result
		} catch (error) {
			throw error
		}
	}

	static async getUsersByUserIdsFromView(
		ids,
		page,
		limit,
		filter,
		saasFilter = '',
		additionalProjectionclause = '',
		returnOnlyUserId
	) {
		try {
			const filterConditions = []

			if (filter && typeof filter === 'object') {
				for (const key in filter) {
					if (Array.isArray(filter[key])) {
						filterConditions.push(`"${key}" @> ARRAY[:${key}]::character varying[]`)
					}
				}
			}

			const excludeUserIds = ids.length === 0
			const userFilterClause = excludeUserIds ? '' : `user_id IN (${ids.join(',')})`

			let filterClause = filterConditions.length > 0 ? ` ${filterConditions.join(' AND ')}` : ''

			let saasFilterClause = saasFilter !== '' ? saasFilter : ''
			if (excludeUserIds && Object.keys(filter).length === 0) {
				saasFilterClause = saasFilterClause.replace('AND ', '') // Remove "AND" if excludeUserIds is true and filter is empty
			}

			let projectionClause =
				'user_id,meta,visibility,organization_id,designation,area_of_expertise,education_qualification'

			if (returnOnlyUserId) {
				projectionClause = 'user_id'
			} else if (additionalProjectionclause !== '') {
				projectionClause += `,${additionalProjectionclause}`
			}

			if (userFilterClause && filterClause.length > 0) {
				filterClause = filterClause.startsWith('AND') ? filterClause : 'AND' + filterClause
			}

			let query = `
				SELECT ${projectionClause}
				FROM
					${common.materializedViewsPrefix + MenteeExtension.tableName}
				WHERE
					${userFilterClause}
					${filterClause}
					${saasFilterClause}
			`

			const replacements = {
				...filter, // Add filter parameters to replacements
			}

			if (page !== null && limit !== null) {
				query += `
					OFFSET
						:offset
					LIMIT
						:limit;
				`

				replacements.offset = limit * (page - 1)
				replacements.limit = limit
			}

			const mentees = await Sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: replacements,
			})

			return {
				data: mentees,
				count: mentees.length,
			}
		} catch (error) {
			return error
		}
	}
}
