/**
 * name : models/users/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

// Dependencies
const ObjectId = require('mongoose').Types.ObjectId
const Users = require('./model')

module.exports = class UsersData {
	static async findOne(filter, projection = {}) {
		try {
			const userData = await Users.findOne(filter, projection).lean({
				getters: true,
			})
			return userData
		} catch (error) {
			return error
		}
	}

	static async findAllUsers(filter, projection = {}) {
		try {
			const usersData = await Users.find(filter, projection).lean({
				getters: true,
			})
			return usersData
		} catch (error) {
			return error
		}
	}

	static async createUser(data) {
		try {
			await new Users(data).save()
			return true
		} catch (error) {
			return error
		}
	}

	static async updateOneUser(filter, update, options = {}) {
		try {
			const res = await Users.updateOne(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return true
			} else {
				return false
			}
		} catch (error) {
			return error
		}
	}

	static async searchMentors(page, limit, search, userId) {
		try {
			let users = await Users.aggregate([
				{
					$match: {
						deleted: false,
						isAMentor: true,
						_id: {
							$ne: ObjectId(userId),
						},
						$or: [{ name: new RegExp(search, 'i') }],
					},
				},
				{
					$project: {
						name: 1,
						image: 1,
						areasOfExpertise: 1,
					},
				},
				{
					$sort: { name: 1 },
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
			]).collation({ locale: 'en', caseLevel: false })

			return users
		} catch (error) {
			return error
		}
	}
	static async listUsers(type, page, limit, search) {
		try {
			let isAMentorFlag = true
			if (type === 'mentor') {
				isAMentorFlag = true
			} else if (type === 'mentee') {
				isAMentorFlag = false
			}
			let users = await Users.aggregate([
				{
					$match: {
						deleted: false,
						isAMentor: isAMentorFlag,
						$or: [{ name: new RegExp(search, 'i') }],
					},
				},
				{
					$project: {
						name: 1,
						image: 1,
						areasOfExpertise: 1,
					},
				},
				{
					$sort: { name: 1 },
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
			]).collation({ locale: 'en', caseLevel: false })

			return users
		} catch (error) {
			return error
		}
	}
}
