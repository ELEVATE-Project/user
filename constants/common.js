/**
 * name : constants/common.js
 * author : Aman Kumar Gupta
 * Date : 29-Sep-2021
 * Description : All commonly used constants through out the service
 */

const successResponse = (statusCode = 500, message, data = [], totalCounts = undefined, token = undefined) => {
    return {
        statusCode,
        message,
        data,
        totalCounts,
        token
    }
};

const failureResponse = ({ message = "Oops! Something Went Wrong.", statusCode = 500 }) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

module.exports = {
    pagination: {
        DEFAULT_PAGE_NO: 1,
        DEFAULT_PAGE_SIZE: 100,
    },
    successResponse,
    failureResponse
};