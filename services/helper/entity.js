// Dependencies
const ObjectId = require('mongoose').Types.ObjectId;
const utilsHelper = require("../../generics/utils");
const httpStatusCode = require("../../generics/http-status");
const apiResponses = require("../../constants/api-responses");
const common = require('../../constants/common');
const entitiesData = require("../../db/entities/query");

module.exports = class EntityHelper {

    /**
     * Create entity.
     * @method
     * @name create
     * @param {Object} bodyData - entity body data.
     * @param {String} _id - entity id.
     * @returns {JSON} - Entity created response.
    */

    static async create(bodyData, _id) {
        bodyData.createdBy = ObjectId(_id);
        bodyData.updatedBy = ObjectId(_id);
        try {
            const entity = await entitiesData.findOneEntity(bodyData.type, bodyData.value);
            if (entity) {
                return common.failureResponse({ message: apiResponses.ENTITY_ALREADY_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            await entitiesData.createEntity(bodyData);
            return common.successResponse({ statusCode: httpStatusCode.created, message: apiResponses.ENTITY_CREATED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update entity.
     * @method
     * @name update
     * @param {Object} bodyData - entity body data.
     * @param {String} _id - entity id.
     * @param {String} loggedInUserId - logged in user id.
     * @returns {JSON} - Entity updted response.
    */

    static async update(bodyData, _id, loggedInUserId) {
        bodyData.updatedBy = loggedInUserId;
        bodyData.updatedAt = new Date().getTime();
        try {
            const result = await entitiesData.updateOneEntity(_id, bodyData);
            if (result === 'ENTITY_ALREADY_EXISTS') {
                return common.failureResponse({ message: apiResponses.ENTITY_ALREADY_EXISTS, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            } else if (result === 'ENTITY_NOT_FOUND') {
                return common.failureResponse({ message: apiResponses.ENTITY_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            return common.successResponse({ statusCode: httpStatusCode.accepted, message: apiResponses.ENTITY_UPDATED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Read entity.
     * @method
     * @name read
     * @param {Object} bodyData - entity body data.
     * @returns {JSON} - Entity read response.
    */

    static async read(bodyData) {
        if (!bodyData.deleted) {
            bodyData.deleted = false;
        }
        try {
            const entities = await entitiesData.findAllEntities(bodyData);
            return common.successResponse({ statusCode: httpStatusCode.ok, message: apiResponses.ENTITY_FETCHED_SUCCESSFULLY, result: entities });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete entity.
     * @method
     * @name delete
     * @param {String} _id - Delete entity.
     * @returns {JSON} - Entity deleted response.
    */

    static async delete(_id) {
        try {
            const result = await entitiesData.deleteOneEntity(_id);
            if (result === 'ENTITY_ALREADY_EXISTS') {
                return common.failureResponse({ message: apiResponses.ENTITY_ALREADY_DELETED, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            } else if (result === 'ENTITY_NOT_FOUND') {
                return common.failureResponse({ message: apiResponses.ENTITY_NOT_FOUND, statusCode: httpStatusCode.bad_request, responseCode: 'CLIENT_ERROR' });
            }
            return common.successResponse({ statusCode: httpStatusCode.accepted, message: apiResponses.ENTITY_DELETED_SUCCESSFULLY });
        } catch (error) {
            throw error;
        }
    }
}