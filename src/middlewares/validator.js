/**
 * name : middlewares/validator
 * author : Aman Kumar Gupta
 * Date : 20-Oct-2021
 * Description : Contains logic to call required validator from validators directory to validate request data
 */
const fs = require('fs')

module.exports = (req, res, next) => {
	try {
		//Checks path existence
		let reqPath =
			fs.existsSync(
				PROJECT_ROOT_DIRECTORY +
					'/controllers/' +
					req.params.version +
					'/' +
					req.params.controller +
					'/' +
					req.params.file +
					'.js'
			) ||
			fs.existsSync(
				PROJECT_ROOT_DIRECTORY + '/controllers/' + req.params.version + '/' + req.params.controller + '.js'
			)
		if (reqPath) {
			require(`@validators/${req.params.version}/${req.params.controller}`)[req.params.method](req)
		} else {
			const error = new Error('Requested resource not found!!!')
			error.status = 404
			error.responseCode = 'RESOURCE_ERROR'
			next(error)
		}
	} catch (error) {}
	next()
}
