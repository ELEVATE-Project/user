/**
 * name : core-services/v1/event/event/EventService
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : Event service containing core business logic
 */

const { successResponse, failureResponse } = require('../../../constants/common');
const httpStatus = require('../../../constants/http-status');
const apiResponses = require('../../../constants/api-responses');

module.exports = new class EventService {

    async fetchEvents() {
        try {
            console.log('Event Service Triggered');
            /* Enable this to check error flow */
            // throw failureResponse({ message: 'Test Error Not Found', statusCode: httpStatus.bad_request });

            return successResponse(httpStatus.ok, apiResponses.eventFetched, [{ id: 1, name: 'Test Event', dateTime: '1633091850830' }], 10);
        } catch (error) {
            return error;
        }
    }

    login() {
        
    }
};