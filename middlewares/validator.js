/**
 * name : middlewares/validator
 * author : Aman Kumar Gupta
 * Date : 04-Nov-2021
 * Description : Contains logic to call required validator from validators directory to validate request data
 */

module.exports = (req, res, next) => {
    try {
        require(`../validators/${req.params.version}/${req.params.controller}`)[req.params.method](req);
    } catch (error) { }
    next();
};