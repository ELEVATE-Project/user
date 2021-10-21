/**
 * name : routes
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : Routes for available service
 */

const validator = require('../middlewares/validator');
const authenticator = require('../middlewares/authenticator');
const expressValidator = require('express-validator');

module.exports = (app) => {

    app.use(authenticator);
    app.use(expressValidator());

    async function router(req, res, next) {
        let controllerResponse;

        /* Check for input validation error */
        const validationError = req.validationErrors();

        if (validationError.length) {
          const error = new Error('Validation failed, Entered data is incorrect!');
          error.statusCode = 422;
          error.data = validationError;
          next(error);
        }

        try {
            const controller = require(`../controllers/${req.params.version}/${req.params.controller}`);
            controllerResponse = await new controller()[req.params.method](req);
        } catch (error) { // if requested resource not found, i.e method does not exists
            return next();
        }

        if (controllerResponse.statusCode !== 200 && controllerResponse.statusCode !== 201 && controllerResponse.statusCode !== 202) {
            /* If error obtained then global error handler gets executed */
            return next(controllerResponse);
        }
        res.status(controllerResponse.statusCode).json(controllerResponse);
    }

    app.all("/:version/:controller/:method", validator, router);
    app.all("/:version/:controller/:method/:id", validator, router);

    app.use((req, res, next) => {
        res.status(404).send('Requested resource not found!');
    });

    // Global error handling middleware, should be present in last in the stack of a middleware's
    app.use((error, req, res, next) => {
        const status = error.statusCode || 500;
        const message = error.message || '';
        let errorData = [];

        if (error.data) {
            errorData = error.data;
        }
        res.status(status).json({
            message: message,
            status: 'failure',
            statusCode: status,
            error: errorData
        });
    });
};