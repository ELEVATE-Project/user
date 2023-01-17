/**
 * name : models/entities/query
 * author : Aman Gupta
 * Date : 04-Nov-2021
 * Description : Users entities database operations
 */

// Dependencies
const ObjectId = require('mongoose').Types.ObjectId
const Organisation = require('./model')

module.exports = class organisationData {
	static async create(data) {
		try {
			const organisationDataRes = await new Organisation(data).save()
			return organisationDataRes
		} catch (error) {
			return error
		}
	}

	static async findOneOrganisation(filter, projection = {}) {
		try {
			const organisationData = await Organisation.findOne(filter, projection)
			return organisationData
		} catch (error) {
			return error
		}
	}

	static async findAll(filter, projection = {}) {
		try {
			const OrganisationData = await Organisation.find(filter, projection)
			return OrganisationData
		} catch (error) {
			return error
		}
	}

	static async updateOne(filter, update, options = {}) {
		try {
			const res = await Organisation.updateOne(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return 'ORGANISATION_UPDATED'
			} else if ((res.n === 1 && res.nModified === 0) || (res.matchedCount === 1 && res.modifiedCount === 0)) {
				return 'ORGANISATION_ALREADY_EXISTS'
			} else {
				return 'ORGANISATION_NOT_FOUND'
			}
		} catch (error) {
			return error
		}
	}

	static async findOne(_id) {
		try {
			const filter = {
				_id: ObjectId(_id),
			}
			return await Organisation.findOne(filter)
		} catch (error) {
			return error
		}
	}
}
