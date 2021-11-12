/**
 * name : routes
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : Routes for available service
 */

const validator = require('../middlewares/validator');
const authenticator = require('../middlewares/authenticator');
const pagination = require('../middlewares/pagination');
const expressValidator = require('express-validator');
const fs = require("fs");

module.exports = (app) => {

    app.use(authenticator);
    app.use(pagination);
    app.use(expressValidator());

    async function router(req, res, next) {
        let controllerResponse;
        let validationError;

        /* Check for input validation error */
        try {
            validationError = req.validationErrors();
        } catch (error) {
            error.statusCode = 422;
            error.responseCode = 'CLIENT_ERROR';
            return next(error);
        }

        if (validationError.length) {
            const error = new Error('Validation failed, Entered data is incorrect!');
            error.statusCode = 422;
            error.responseCode = 'CLIENT_ERROR';
            error.data = validationError;
            return next(error);
        }

        try {
            const controller = require(`../controllers/${req.params.version}/${req.params.controller}`);
            controllerResponse = await new controller()[req.params.method](req);
        } catch (error) { // If controller or service throws some random error
            return next(error);
        }

        if (controllerResponse.isResponseAStream == true) {
            fs.exists(controllerResponse.fileNameWithPath, function (exists) {
  
              if (exists) {
  
                res.setHeader(
                  'Content-disposition', 
                  'attachment; filename=' + controllerResponse.fileNameWithPath.split('/').pop()
                );
                res.set('Content-Type', 'application/octet-stream');
                fs.createReadStream(controllerResponse.fileNameWithPath).pipe(res);
  
              } else {}
            });
        } else {
            if (controllerResponse.statusCode !== 200 && controllerResponse.statusCode !== 201 && controllerResponse.statusCode !== 202) {
                /* If error obtained then global error handler gets executed */
                return next(controllerResponse);
            }
    
            res.status(controllerResponse.statusCode).json({
                responseCode: controllerResponse.responseCode,
                message: controllerResponse.message,
                result: controllerResponse.result
            });
        }

    }

    app.all("/user/:version/:controller/:method", validator, router);
    app.all("/user/:version/:controller/:method/:id", validator, router);

    // app.use((req, res, next) => {
    //     res.status(404).json({
    //         responseCode: 'RESOURCE_ERROR',
    //         message: 'Requested resource not found!',
    //     });
    // });

    // Global error handling middleware, should be present in last in the stack of a middleware's
    app.use((error, req, res, next) => {
        const status = error.statusCode || 500;
        const responseCode = error.responseCode || 'SERVER_ERROR';
        const message = error.message || '';
        let errorData = [];

        if (error.data) {
            errorData = error.data;
        }
        res.status(status).json({
            responseCode,
            message,
            error: errorData
        });
    });
};