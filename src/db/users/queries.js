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
	static findOne(filter, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const userData = await Users.findOne(filter, projection)
				resolve(userData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static findAllUsers(filter, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const usersData = await Users.find(filter, projection)
				resolve(usersData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static createUser(data) {
		return new Promise(async (resolve, reject) => {
			try {
				await new Users(data).save()
				resolve(true)
			} catch (error) {
				reject(error)
			}
		})
	}

	static updateOneUser(filter, update, options = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await Users.updateOne(filter, update, options)
				if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
					resolve(true)
				} else {
					resolve(false)
				}
			} catch (error) {
				reject(error)
			}
		})
	}

	static searchMentors(page, limit, search, userId) {
		return new Promise(async (resolve, reject) => {
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

				return resolve(users)
			} catch (error) {
				return reject(error)
			}
		})
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
