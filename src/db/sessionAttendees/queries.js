/**
 * name : models/sessionAttendees/queries
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Session Attendes database operations
 */

const ObjectId = require('mongoose').Types.ObjectId

const SessionAttendees = require('./model')

module.exports = class SessionsAttendees {
	static async create(data) {
		try {
			return await new SessionAttendees(data).save()
		} catch (error) {
			return error
		}
	}

	static async findAttendeeBySessionAndUserId(id, sessionId) {
		try {
			const session = await SessionAttendees.findOne({
				userId: id,
				sessionId: sessionId,
				deleted: false,
			}).lean()
			return session
		} catch (error) {
			return error
		}
	}

	static async countSessionAttendees(filterStartDate, filterEndDate, userId) {
		try {
			const filter = {
				createdAt: {
					$gte: filterStartDate.toISOString(),
					$lte: filterEndDate.toISOString(),
				},
				userId: ObjectId(userId),
				deleted: false,
			}
			const count = await SessionAttendees.countDocuments(filter)
			return count
		} catch (error) {
			return error
		}
	}

	static async countSessionAttendeesThroughStartDate(filterStartDate, filterEndDate, userId) {
		try {
			const filter = {
				'sessionDetail.startDateUtc': {
					$gte: filterStartDate.toISOString(),
					$lte: filterEndDate.toISOString(),
				},
				userId: ObjectId(userId),
				deleted: false,
				isSessionAttended: true,
			}

			const result = await SessionAttendees.aggregate([
				{
					$lookup: {
						from: 'sessions',
						localField: 'sessionId',
						foreignField: '_id',
						as: 'sessionDetail',
					},
				},
				{
					$match: filter,
				},
				{
					$count: 'count',
				},
			])
			return result.length ? result[0].count : 0
		} catch (error) {
			return error
		}
	}

	static async updateOne(filter, update) {
		try {
			const updateResponse = await SessionAttendees.updateOne(filter, update)
			if (
				(updateResponse.n === 1 && updateResponse.nModified === 1) ||
				(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)
			) {
				return 'SESSION_ATTENDENCE_UPDATED'
			} else if (
				(updateResponse.n === 1 && updateResponse.nModified === 0) ||
				(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)
			) {
				return 'SESSION_ATTENDENCE_ALREADY_UPDATED'
			} else {
				return 'SESSION_ATTENDENCE_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}

	static async unEnrollFromSession(sessionId, userId) {
		try {
			const result = await SessionAttendees.deleteOne({ sessionId, userId }).lean()
			if (result && result.deletedCount === 1) {
				return 'USER_UNENROLLED'
			} else {
				return 'USER_NOT_ENROLLED'
			}
		} catch (error) {
			return error
		}
	}

	static async findAllUpcomingMenteesSession(page, limit, search, filters) {
		try {
			filters.userId = ObjectId(filters.userId)
			const sessionAttendeesData = await SessionAttendees.aggregate([
				{
					$lookup: {
						from: 'sessions',
						localField: 'sessionId',
						foreignField: '_id',
						as: 'sessionDetail',
					},
				},
				{
					$match: {
						$and: [filters, { deleted: false }, { 'sessionDetail.deleted': false }],
						$or: [
							{ 'sessionDetail.title': new RegExp(search, 'i') },
							{ 'sessionDetail.mentorName': new RegExp(search, 'i') },
						],
					},
				},
				{
					$sort: { 'sessionDetail.startDateUtc': 1 },
				},
				{
					$project: {
						_id: 1,
						sessionId: 1,
						sessionDetail: {
							$arrayElemAt: ['$sessionDetail', 0],
						},
					},
				},
				{
					$project: {
						_id: 1,
						sessionId: 1,
						title: '$sessionDetail.title',
						userId: '$sessionDetail.userId',
						description: '$sessionDetail.description',
						startDate: '$sessionDetail.startDate',
						endDate: '$sessionDetail.endDate',
						endDateUtc: '$sessionDetail.endDateUtc',
						status: '$sessionDetail.status',
						image: '$sessionDetail.image',
						'meetingInfo.platform': '$sessionDetail.meetingInfo.platform',
						'meetingInfo.value': '$sessionDetail.meetingInfo.value',
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
			return sessionAttendeesData
		} catch (error) {
			return error
		}
	}

	static async findPendingFeedbackSessions(filters) {
		try {
			const sessionAttendeesData = await SessionAttendees.aggregate([
				{
					$lookup: {
						from: 'sessions',
						localField: 'sessionId',
						foreignField: '_id',
						as: 'sessionDetail',
					},
				},
				{
					$match: {
						$and: [filters, { deleted: false }],
					},
				},
				{
					$project: {
						sessionId: 1,
						'sessionDetail._id': 1,
						'sessionDetail.title': 1,
						'sessionDetail.description': 1,
						'sessionDetail.status': 1,
						'sessionDetail.menteeFeedbackForm': 1,
					},
				},
				{ $unwind: '$sessionDetail' },
			])
			return sessionAttendeesData
		} catch (error) {
			return error
		}
	}

	static async findOneSessionAttendee(sessionId, userId) {
		try {
			const session = await SessionAttendees.findOne({ sessionId, userId, deleted: false }).lean()
			return session
		} catch (error) {
			return error
		}
	}

	static async countAllSessionAttendees(filters) {
		try {
			return await SessionAttendees.count({
				...filters,
				deleted: false,
			})
		} catch (error) {
			return error
		}
	}

	static async findAllSessionAttendees(filters) {
		try {
			let sessionAttendeesData = await SessionAttendees.find({
				...filters,
				deleted: false,
			}).lean()
			return sessionAttendeesData
		} catch (error) {
			return error
		}
	}
}
