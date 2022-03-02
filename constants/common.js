/**
 * name : constants/common.js
 * author : Aman Kumar Gupta
 * Date : 29-Sep-2021
 * Description : All commonly used constants through out the service
 */


/**
  * Success response
  * @method
  * @name successResponse
  * @param  {String} statusCode status code of the response.
  * @param  {String} responseCode response code.
  * @param  {String} message response message.
  * @param {String} result - result 
  * @returns {JSON} Returns response format
*/    
const successResponse = ({statusCode = 200, responseCode = 'OK', message, result = []}) => {
    return {
        statusCode,
        responseCode,
        message,
        result
    }
};


/**
  * failure response
  * @method
  * @name failureResponse
  * @param  {String} statusCode status code of the failure response.
  * @param  {String} responseCode response code.
  * @param  {String} message response message.
  * @param {String} result - result 
  * @returns {JSON} Returns response error
*/  
const failureResponse = ({ message = "Oops! Something Went Wrong.", statusCode = 500, responseCode }) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.responseCode = responseCode;
    return error;
};

module.exports = {
    pagination: {
        DEFAULT_PAGE_NO: 1,
        DEFAULT_PAGE_SIZE: 100,
    },
    accessTokenSecret: 'hsghasghjab1273JHajnbabsjdj1273981273jhajksdh8y3123yhjkah812398yhjqwe7617237yuhdhhdqwu271',
    refreshTokenSecret: '371hkjkjady2y3ihdkajshdkiq23iuekw71yekhaskdvkvegavy23t78veqwexqvxveit6ttxyeeytt62tx236vv',
    successResponse,
    failureResponse,
    guestUrls: []
};