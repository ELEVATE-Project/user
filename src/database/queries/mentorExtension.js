const MentorExtension = require('@database/models/index').MentorExtension // Adjust the path accordingly
const { QueryTypes } = require('sequelize')
const sequelize = require('sequelize')
const Sequelize = require('@database/models/index').sequelize
const common = require('@constants/common')
const _ = require('lodash')

module.exports = class MentorExtensionQueries {
	static async getColumns() {
		try {
			return await Object.keys(MentorExtension.rawAttributes)
		} catch (error) {
			return error
		}
	}
	static async createMentorExtension(data) {
		try {
			return await MentorExtension.create(data, { returning: true })
		} catch (error) {
			throw error
		}
	}

	static async updateMentorExtension(userId, data, options = {}, customFilter = {}) {
		try {
			if (data.user_id) {
				delete data['user_id']
			}
			const whereClause = _.isEmpty(customFilter) ? { user_id: userId } : customFilter
			return await MentorExtension.update(data, {
				where: whereClause,
				...options,
			})
		} catch (error) {
			throw error
		}
	}

	static async getMentorExtension(userId, attributes = []) {
		try {
			const queryOptions = {
				where: { user_id: userId },
				raw: true,
			}

			// If attributes are passed update query
			if (attributes.length > 0) {
				queryOptions.attributes = attributes
			}
			const mentor = await MentorExtension.findOne(queryOptions)
			return mentor
		} catch (error) {
			throw error
		}
	}

	static async deleteMentorExtension(userId, force = false) {
		try {
			const options = { where: { user_id: userId } }

			if (force) {
				options.force = true
			}

			return await MentorExtension.destroy(options)
		} catch (error) {
			throw error
		}
	}
	static async removeMentorDetails(userId) {
		try {
			return await MentorExtension.update(
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
	static async getMentorsByUserIds(ids, options = {}) {
		try {
			const result = await MentorExtension.findAll({
				where: {
					user_id: ids,
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

	static async getAllMentors(options = {}) {
		try {
			const result = await MentorExtension.findAll({
				...options,
				returning: true,
				raw: true,
			})

			return result
		} catch (error) {
			throw error
		}
	}

	static async getMentorsByUserIdsFromView(
		ids,
		page = null,
		limit = null,
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

			const filterClause = filterConditions.length > 0 ? `${filterConditions.join(' AND ')}` : ''

			let saasFilterClause = saasFilter !== '' ? saasFilter : ''
			if (excludeUserIds && Object.keys(filter).length === 0) {
				saasFilterClause = saasFilterClause.replace('AND ', '') // Remove "AND" if excludeUserIds is true and filter is empty
			}

			let projectionClause =
				'user_id,rating,meta,visibility,organization_id,designation,area_of_expertise,education_qualification,custom_entity_text'

			if (returnOnlyUserId) {
				projectionClause = 'user_id'
			} else if (additionalProjectionclause !== '') {
				projectionClause += `,${additionalProjectionclause}`
			}

			let query = `
				SELECT ${projectionClause}
				FROM
					${common.materializedViewsPrefix + MentorExtension.tableName}
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

			const mentors = await Sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: replacements,
			})

			return {
				data: mentors,
				count: mentors.length,
			}
		} catch (error) {
			return error
		}
	}
}
