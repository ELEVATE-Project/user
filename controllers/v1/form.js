/**
 * name : form.js
 * author : Aman Gupta
 * created-date : 03-Nov-2021
 * Description : Form Controller.
 */

// Dependencies
const formsHelper = require("../../services/helper/form");

module.exports = class Account {

    /**
    * @api {post} /user/v1/form/create
    * @apiVersion 1.0.0
    * @apiName Creates User Form
    * @apiGroup Form
    * @apiParamExample {json} Request-Body:
    * {
    *   "name" : "mentee name",
    *   "email" : "mentee@gmail.com",
    *   "password" : "menteepass",
    * }
    * @apiSampleRequest /user/v1/form/create
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Form created successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * create users form
    * @method
    * @name create
    * @param {Object} req -request data.
    * @returns {JSON} - forms creation object.
    */

    async create(req) {
        const params = req.body;
        try {
            const createdForm = await formsHelper.create(params);
            return createdForm;
        } catch (error) {
            return error;
        }
    }

    async update(req) {
        const params = req.body;
        const _id = req.params.id
        try {
            const updatedForm = await formsHelper.update(params, _id);
            return updatedForm;
        } catch (error) {
            return error;
        }
    }

    async read(req) {
        const params = req.body;
        try {
            const form = await formsHelper.read(params);
            return form;
        } catch (error) {
            return error;
        }
    }
}