const MenteeExtension = require('../models/index').UserExtension
const _ = require('lodash')

module.exports = class MenteeExtensionQueries {
	static async getColumns() {
		try {
			return await Object.keys(MenteeExtension.rawAttributes)
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
					education_qualification: [],
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
					org_id,
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
}
