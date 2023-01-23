/**
 * name : organisations.js
 * author : Rakesh Kumar
 * created-date : 13-01-2023
 * Description : User Account.
 */

// Dependencies
const OrganisationsHelper = require('@services/helper/organisations')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

module.exports = class Organisations {
	/**
	 * create mentee account
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {Object} req.body -request body contains organisation deatils.
	 * @param {String} req.body.code -  code of the organisation.
	 * @param {String} req.body.name - name of the organisation.
	 * @param {String} req.body.description - description of the organisation.
	 * @returns {JSON} - response contains organisation creation details.
	 */

	async create(req) {
		const params = req.body
		try {
			const createdOrganisation = await OrganisationsHelper.create(params)
			return createdOrganisation
		} catch (error) {
			return error
		}
	}

	async details(req) {
		try {
			if (req.params.id) {
				const Organisation = await OrganisationsHelper.read(req.params.id)
				return Organisation
			} else {
				const Organisation = await OrganisationsHelper.readAll()
				return Organisation
			}
		} catch (error) {
			return error
		}
	}

	async update(req) {
		const params = req.body
		try {
			const updatedOrganisation = await OrganisationsHelper.update(params, req.params.id, req.decodedToken._id)
			return updatedOrganisation
		} catch (error) {
			return error
		}
	}

	/**
	 * Delete Organisation
	 * @method
	 * @name delete
	 * @param {Object} req - request data.
	 * @param {string} req.params.id - Organisation id.
	 * @returns {JSON} - Organisation deletion response.
	 */

	async delete(req) {
		const _id = req.params.id
		try {
			const deleteOrganisation = await OrganisationsHelper.delete(_id)
			return deleteOrganisation
		} catch (error) {
			return error
		}
	}

	/**
	 * List of Organisations
	 * @method
	 * @name list
	 * @param {Object} req - request data.
	 * @param {string} req.params.id - Organisation id.
	 * @returns {JSON} - Organisation deletion response.
	 */

	async list(req) {
		try {
			const organisationList = await OrganisationsHelper.list(req.pageNo, req.pageSize, req.searchText)
			return organisationList
		} catch (error) {
			return error
		}
	}
}
