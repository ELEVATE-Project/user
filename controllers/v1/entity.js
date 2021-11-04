/**
 * name : entity.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : Entity Controller.
 */

// Dependencies
const entityHelper = require("../../services/helper/entity");

module.exports = class Entity {

    /**
    * @api {post} /mentoring/v1/entity/create
    * @apiVersion 1.0.0
    * @apiName Creates Entity
    * @apiGroup entity
    * @apiParamExample {json} Request-Body:
    * {
    *    "code": "ELDS",
    *    "name": "Educational Leadership",
    *    "type": "categories"
    * }
    * @apiSampleRequest /mentoring/v1/entity/create
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Entity created successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * create entity
    * @method
    * @name create
    * @param {Object} req - request data.
    * @returns {JSON} - entities creation object.
    */

    async create(req) {
        const params = req.body;
        try {
            const createdEntity = await entityHelper.create(params, req.decodedToken._id);
            return createdEntity;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /mentoring/v1/entity/update/:id
    * @apiVersion 1.0.0
    * @apiName Updates Enitity
    * @apiGroup entity
    * @apiParamExample {json} Request-Body:
    *    {
    *        "code": "ELDS", [Optional]
    *        "name": "Educational Leadership", [Optional]
    *        "status": "ACTIVE", [Optional]
    *        "type": "categories" [Optional]
    *    }
    * @apiSampleRequest /mentoring/v1/entity/update/618270f757db5c85408af777
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Entity updated successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * updates entity
    * @method
    * @name update
    * @param {Object} req - request data.
    * @returns {JSON} - entities updation response.
    */

    async update(req) {
        const params = req.body;
        const _id = req.params.id
        try {
            const updatedEntity = await entityHelper.update(params, _id, req.decodedToken._id);
            return updatedEntity;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /mentoring/v1/entity/read
    * @apiVersion 1.0.0
    * @apiName Read Entity
    * @apiGroup Form
    * @apiParamExample {json} Request-Body:
    *  {
    *   "type": "categories",
    *   "deleted": false, [Optional]
    *   "status": "ACTIVE", [Optional]
    *  }
    * @apiSampleRequest /mentoring/v1/entity/read
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Entities fetched successfully",
    *   "result": [
            {
                "status": "ACTIVE",
                "deleted": false,
                "_id": "6183a07a82f62b6c5d2661d9",
                "code": "ELDS",
                "name": "Educational Leadership",
                "type": "categories",
                "createdBy": "617a7250302ab95a9fc37603",
                "updatedBy": "617a7250302ab95a9fc37603",
                "updatedAt": "2021-11-04T08:57:30.912Z",
                "createdAt": "2021-11-04T08:57:30.912Z",
                "__v": 0
            },
            {
                "status": "ACTIVE",
                "deleted": false,
                "_id": "6183a09382f62b6c5d2661dc",
                "code": "PATD",
                "name": "Positive Attitude",
                "type": "categories",
                "createdBy": "617a7250302ab95a9fc37603",
                "updatedBy": "617a7250302ab95a9fc37603",
                "updatedAt": "2021-11-04T08:57:55.305Z",
                "createdAt": "2021-11-04T08:57:55.305Z",
                "__v": 0
            }
        ]
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * reads entities
    * @method
    * @name read
    * @param {Object} req - request data.
    * @returns {JSON} - entities.
    */

    async read(req) {
        const params = req.query;
        try {
            const form = await entityHelper.read(params);
            return form;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /mentoring/v1/entity/delete/:id
    * @apiVersion 1.0.0
    * @apiName Deletes Enitity
    * @apiGroup entity
    * @apiParamExample {json} Request-Body: 
    * {}
    * @apiSampleRequest /mentoring/v1/entity/delete/618270f757db5c85408af777
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Entity deleted successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * deletes entity
    * @method
    * @name delete
    * @param {Object} req - request data.
    * @returns {JSON} - entities deletion response.
    */

     async delete(req) {
        const _id = req.params.id
        try {
            const updatedEntity = await entityHelper.delete(_id);
            return updatedEntity;
        } catch (error) {
            return error;
        }
    }
}