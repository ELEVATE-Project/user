/**
 * name : routes
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : Routes for available service
 */

module.exports = (app) => {

    async function router(req, res, next) {
        let controller;
        let controllerResponse;
        try {
            /* Dynamically loaded requested controller */
            // and required here to minimize space complexity so that the memory to controller will only get allocated when request is made and then it gets destroyed when response is sent
            controller = require(`../controllers/${req.params.version}/${req.params.controller}`)
        } catch (error) { // if module not get found, say some one requested unsupported version or controller
            return next();
        }

        try {
            controllerResponse = await controller[req.params.method](req);
        } catch (error) { // if requested resource not found, i.e method does not exists
            return next();
        }

        if (controllerResponse.statusCode !== 200 && controllerResponse.statusCode !== 201 && controllerResponse.statusCode !== 202) {
            /* If error obtained then global error handler gets executed */
            return next(controllerResponse);
        }
        res.status(controllerResponse.statusCode).json(controllerResponse);
    }

    app.all("/:version/:controller/:method", router);
    app.all("/:version/:controller/:method/:id", router);

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