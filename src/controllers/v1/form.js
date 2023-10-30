/**
 * name : form.js
 * author : Aman Gupta
 * created-date : 03-Nov-2021
 * Description : Form Controller.
 */

// Dependencies
const formsService = require('@services/form')

module.exports = class Form {
	/**
	 * create form data
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - form type.
	 * @param {string} req.body.subType -subtype of the form.
	 * @param {string} req.body.action -form action.
	 * @param {string} req.body.data -form data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the form data
	 */

	async create(req) {
		const params = req.body
		try {
			const createdForm = await formsService.create(params, req.decodedToken.organization_id)
			return createdForm
		} catch (error) {
			return error
		}
	}

	/**
	 * update form data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - form type.
	 * @param {string} req.body.subType -subtype of the form.
	 * @param {string} req.body.action -form action.
	 * @param {string} req.body.data -form data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the form data
	 */

	async update(req) {
		const params = req.body
		try {
			const updatedForm = await formsService.update(req.params.id, params, req.decodedToken.organization_id)
			return updatedForm
		} catch (error) {
			return error
		}
	}

	/**
	 * read form
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - form type.
	 * @param {string} req.body.subType -subtype of the form.
	 * @param {string} req.body.action -form action.
	 * @param {string} req.body.data -form data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the form data
	 */

	async read(req) {
		const params = req.body
		try {
			if (!req.params.id && Object.keys(req.body).length === 0) {
				const form = await formsService.readAllFormsVersion()
				return form
			} else {
				const form = await formsService.read(req.params.id, params, req.decodedToken.organization_id)
				return form
			}
		} catch (error) {
			return error
		}
	}
}
