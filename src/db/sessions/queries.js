/**
 * name : models/sessions/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Sessions database operations
 */

const Sessions = require('./model')

module.exports = class SessionsData {
	static async createSession(data) {
		try {
			let response = await new Sessions(data).save()
			return response
		} catch (error) {
			return error
		}
	}

	static async updateOneSession(filter, update, options = {}) {
		try {
			const updateResponse = await Sessions.updateOne(filter, update, options)
			if (
				(updateResponse.n === 1 && updateResponse.nModified === 1) ||
				(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)
			) {
				return 'SESSION_UPDATED'
			} else if (
				(updateResponse.n === 1 && updateResponse.nModified === 0) ||
				(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)
			) {
				return 'SESSION_ALREADY_UPDATED'
			} else {
				return 'SESSION_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}

	static async findOneSession(filter, projection = {}) {
		try {
			const sessionData = await Sessions.findOne(filter, projection).lean()
			return sessionData
		} catch (error) {
			return error
		}
	}

	static async findSessionById(id) {
		try {
			console.log('=================', id)
			const session = await Sessions.findOne({ _id: id, deleted: false, status: { $ne: 'cancelled' } }).lean()
			console.log('==============', session)
			return session
		} catch (error) {
			return error
		}
	}

	static async findAllSessions(page, limit, search, filters) {
		try {
			let sessionData = await Sessions.aggregate([
				{
					$match: {
						$and: [filters, { deleted: false }],
						$or: [{ title: new RegExp(search, 'i') }, { mentorName: new RegExp(search, 'i') }],
					},
				},
				{
					$sort: { _id: -1 },
				},
				{
					$project: {
						_id: 1,
						title: 1,
						mentorName: 1,
						description: 1,
						startDate: 1,
						endDate: 1,
						status: 1,
						image: 1,
						endDateUtc: 1,
					},
				},
				{
					$facet: {
						totalCount: [{ $count: 'count' }],
						data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
					},
				},
				{
					$project: {
						data: 1,
						count: {
							$arrayElemAt: ['$totalCount.count', 0],
						},
					},
				},
			])
			return sessionData
		} catch (error) {
			return error
		}
	}

	static async findSessions(filter, projection = {}) {
		try {
			let sessionData = await Sessions.find(filter, projection).lean()
			return sessionData
		} catch (error) {
			return error
		}
	}
	static async countSessions(filter) {
		try {
			const count = await Sessions.countDocuments(filter)
			return count
		} catch (error) {
			return error
		}
	}

	static async updateSession(filter, update, options = {}) {
		try {
			const updateResponse = await Sessions.update(filter, update, options)
			if (
				(updateResponse.n === 1 && updateResponse.nModified === 1) ||
				(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)
			) {
				return 'SESSION_UPDATED'
			} else if (
				(updateResponse.n === 1 && updateResponse.nModified === 0) ||
				(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)
			) {
				return 'SESSION_ALREADY_UPDATED'
			} else {
				return 'SESSION_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}
}
