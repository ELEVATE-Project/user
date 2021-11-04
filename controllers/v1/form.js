/**
 * name : form.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Form Controller.
 */

// Dependencies
const formsHelper = require("../../services/helper/form");

module.exports = class Form {

    /**
    * @api {post} /mentoring/v1/form/create
    * @apiVersion 1.0.0
    * @apiName Creates Mentoring Form
    * @apiGroup Form
    * @apiParamExample {json} Request-Body:
    * {
    *    "type": "session",
    *    "subType": "createSessionForm",
    *    "action": "sessionFields",
    *    "ver": "1.0",
    *    "data": {
    *        "templateName": "defaultTemplate",
    *        "fields": {
    *            "controls": [
    *                {
    *                    "name": "title",
    *                    "label": "title",
    *                    "value": "",
    *                    "class": "ion-margin",
    *                    "type": "text",
    *                    "position":"floating",
    *                    "validators": {
    *                       "required": true,
    *                       "minLength": 5
    *                    }
    *                },
    *                {
    *                    "name": "categories",
    *                    "label": "Select categories",
    *                    "value": "",
    *                    "class": "ion-margin",
    *                    "type": "chip",
    *                    "position": "",
    *                    "disabled": false,
    *                    "showSelectAll": true,
    *                    "validators": {
    *                        "required": true
    *                    }
    *                }
    *            ]
    *        }
    *    }
    * }
    * @apiSampleRequest /mentoring/v1/form/create
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
    * create mentoring form
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

    /**
    * @api {post} /mentoring/v1/form/update/:id
    * @apiVersion 1.0.0
    * @apiName Updates Mentoring Form
    * @apiGroup Form
    * @apiParamExample {json} Request-Body:
    * {
    *    "type": "session",
    *    "subType": "createSessionForm",
    *    "action": "sessionFields",
    *    "ver": "1.0",
    *    "data": {
    *        "templateName": "defaultTemplate",
    *        "fields": {
    *            "controls": [
    *                {
    *                    "name": "title",
    *                    "label": "title",
    *                    "value": "",
    *                    "class": "ion-margin",
    *                    "type": "text",
    *                    "position":"floating",
    *                    "validators": {
    *                       "required": true,
    *                       "minLength": 5
    *                    }
    *                },
    *                {
    *                    "name": "categories",
    *                    "label": "Select categories",
    *                    "value": "",
    *                    "class": "ion-margin",
    *                    "type": "chip",
    *                    "position": "",
    *                    "disabled": false,
    *                    "showSelectAll": true,
    *                    "validators": {
    *                        "required": true
    *                    }
    *                }
    *            ]
    *        }
    *    }
    * }
    * @apiSampleRequest /mentoring/v1/form/update/618270f757db5c85408af777
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Form updated successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * updates mentoring form
    * @method
    * @name update
    * @param {Object} req - request data.
    * @returns {JSON} - forms updation response.
    */

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

    /**
    * @api {post} /mentoring/v1/form/read
    * @apiVersion 1.0.0
    * @apiName Read User Form
    * @apiGroup Form
    * @apiParamExample {json} Request-Body:
    *  {
    *   "type": "session",
    *   "subType": "createSessionForm",
    *   "action": "sessionFields",
    *   "ver": "1.0",
    *   "templateName": "defaultTemplate"
    *  }
    * @apiSampleRequest /mentoring/v1/form/read
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Form fetched successfully",
    *   "result": {
    *        "data": {
    *            "templateName": "defaultTemplate",
    *            "fields": {
    *                "controls": [
    *                    {
    *                        "name": "title",
    *                        "label": "title",
    *                        "value": "",
    *                        "class": "ion-margin",
    *                        "type": "text",
    *                        "position": "floating",
    *                        "validators": {
    *                            "required": true,
    *                            "minLength": 5
    *                         }
    *                    },
    *                    {
    *                        "name": "categories",
    *                        "label": "Select categories",
    *                        "value": "",
    *                        "class": "ion-margin",
    *                        "type": "chip",
    *                        "position": "",
    *                        "disabled": false,
    *                        "showSelectAll": true,
    *                        "validators": {
    *                            "required": true
    *                        }
    *                    }
    *                ]
    *            }
    *        },
    *        "_id": "618270f757db5c85408af777",
    *        "type": "session",
    *        "subType": "createSessionForm",
    *        "action": "sessionFields",
    *        "ver": "1.0",
    *        "updatedAt": "2021-11-03T11:22:31.280Z",
    *        "createdAt": "2021-11-03T11:22:31.280Z",
    *        "__v": 0
    *    }
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * reads mentoring form
    * @method
    * @name read
    * @param {Object} req -request data.
    * @returns {JSON} - form object.
    */

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