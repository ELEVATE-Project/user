/**
 * name : form.js
 * author : Aman Gupta
 * created-date : 03-Nov-2021
 * Description : Form helper.
 */


// Dependencies
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const formsData = require("../../db/forms/queries");

module.exports = class FormsHelper {


    /**
        * create form
        * @method
        * @name create
        * @param {Object} bodyData -request data.
        * @param {string} bodyData.type - form type.
        * @param {string} bodyData.subType -subtype of the form.
        * @param {string} bodyData.action -form action.
        * @param {string} bodyData.data -form data.
        * @param {string} bodyData.data.templateName -name of the template
        * @returns {JSON} - forms created object.
    */

    static async create(bodyData) {
        try {
            const filter = { type: bodyData.type, subType: bodyData.subType, action: bodyData.action, ver: bodyData.ver, "data.templateName": bodyData.data.templateName }
            const form = await formsData.findOneForm(filter);
            if (form) {
                return common.failureResponse({ message: apiResponses.FORM_ALREADY_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            await formsData.createForm(bodyData);
            return common.successResponse({ statusCode: httpStatusCode.created, message: apiResponses.FORM_CREATED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }


    /**
        * update form
        * @method
        * @name update
        * @param {Object} bodyData -request data.
        * @param {string} bodyData.type - form type.
        * @param {string} bodyData.subType -subtype of the form.
        * @param {string} bodyData.action -form action.
        * @param {string} bodyData.data -form data.
        * @param {string} bodyData.data.templateName -name of the template
        * @returns {JSON} - returns update form information
    */
    static async update(bodyData) {
        try {
            const filter = { type: bodyData.type, subType: bodyData.subType, action: bodyData.action, ver: bodyData.ver, 'data.templateName': bodyData.data.templateName };
            const result = await formsData.updateOneForm(filter, bodyData);
            if (result === 'FORM_ALREADY_EXISTS') {
                return common.failureResponse({ message: apiResponses.FORM_ALREADY_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            } else if (result === 'FORM_NOT_FOUND') {
                return common.failureResponse({ message: apiResponses.FORM_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            return common.successResponse({ statusCode: httpStatusCode.accepted, message: apiResponses.FORM_UPDATED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }


    /**
        * read form
        * @method
        * @name read
        * @param {Object} bodyData -request data.
        * @param {string} bodyData.type - form type.
        * @param {string} bodyData.subType -subtype of the form.
        * @param {string} bodyData.action -form action.
        * @param {string} bodyData.data -form data.
        * @param {string} bodyData.data.templateName -name of the template
        * @returns {JSON} - returns the form data
    */

    static async read(bodyData) {
        try {
            const filter = { type: bodyData.type, subType: bodyData.subType, action: bodyData.action, ver: bodyData.ver, "data.templateName": bodyData.templateName }
            const form = await formsData.findOneForm(filter);
            if (!form) {
                return common.failureResponse({ message: apiResponses.FORM_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.FORM_FETCHED_SUCCESSFULLY, result: form ? form : {} });
        } catch (error) {
            throw error;
        }
    }
}