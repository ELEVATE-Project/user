/**
 * name : userentity.js
 * author : Aman Gupta
 * created-date : 04-Nov-2021
 * Description : User Entity Controller.
 */

// Dependencies
const userEntityHelper = require("../../services/helper/userentity");

module.exports = class UserEntity {

    /**
    * @api {post} /user/v1/userentity/create
    * @apiVersion 1.0.0
    * @apiName Creates User Entity
    * @apiGroup userentity
    * @apiParamExample {json} Request-Body:
    * {
    *    "code": "DO",
    *    "name": "District Official",
    *    "type": "roles"
    * }
    * @apiSampleRequest /user/v1/form/create
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "User entity created successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * create user entity
    * @method
    * @name create
    * @param {Object} req -request data.
    * @returns {JSON} - user entities creation object.
    */

    async create(req) {
        const params = req.body;
        try {
            const createdUserEntity = await userEntityHelper.create(params, req.decodedToken._id);
            return createdUserEntity;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/userentity/update/:id
    * @apiVersion 1.0.0
    * @apiName Updates User Enitity
    * @apiGroup userentity
    * @apiParamExample {json} Request-Body:
    *    {
    *        "code": "SO", [Optional]
    *        "name": "State Official", [Optional]
    *        "status": "ACTIVE", [Optional]
    *        "type": "roles" [Optional]
    *    }
    * @apiSampleRequest /user/v1/userentity/update/618270f757db5c85408af777
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "User entity updated successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * updates user entity
    * @method
    * @name update
    * @param {Object} req - request data.
    * @returns {JSON} - user entities updation response.
    */

    async update(req) {
        const params = req.body;
        const _id = req.params.id
        try {
            const updatedEntity = await userEntityHelper.update(params, _id, req.decodedToken._id);
            return updatedEntity;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/userentity/read
    * @apiVersion 1.0.0
    * @apiName Read User Entity
    * @apiGroup Form
    * @apiParamExample {json} Request-Body:
    *  {
    *   "type": "roles",
    *   "deleted": false, [Optional]
    *   "status": "ACTIVE", [Optional]
    *  }
    * @apiSampleRequest /user/v1/userentity/read
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "User entities fetched successfully",
    *   "result": [
            {
                "status": "ACTIVE",
                "deleted": false,
                "_id": "6183a07a82f62b6c5d2661d9",
                "code": "DO",
                "name": "District Official",
                "type": "roles",
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
                "code": "TEACHER",
                "name": "Teacher",
                "type": "roles",
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
    * reads user entities
    * @method
    * @name read
    * @param {Object} req - request data.
    * @returns {JSON} - user entities.
    */

    async read(req) {
        const params = req.query;
        try {
            const form = await userEntityHelper.read(params);
            return form;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/userentity/delete/:id
    * @apiVersion 1.0.0
    * @apiName Deletes User Enitity
    * @apiGroup userentity
    * @apiParamExample {json} Request-Body: 
    * {}
    * @apiSampleRequest /user/v1/userentity/delete/618270f757db5c85408af777
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "User entity deleted successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * deletes user entity
    * @method
    * @name delete
    * @param {Object} req - request data.
    * @returns {JSON} - user entities deletion response.
    */

     async delete(req) {
        const _id = req.params.id
        try {
            const updatedEntity = await userEntityHelper.delete(_id);
            return updatedEntity;
        } catch (error) {
            return error;
        }
    }
}