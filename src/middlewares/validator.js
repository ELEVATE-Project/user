/**
 * name : middlewares/validator
 * author : Aman Kumar Gupta
 * Date : 20-Oct-2021
 * Description : Contains logic to call required validator from validators directory to validate request data
 */

module.exports = (req, res, next) => {
	try {
		if (!req.params.version || !req.params.controller || !req.params.method) {
			throw new Error('Missing required path parameters')
		}

		const version = (req.params.version.match(/^v\d+$/) || [])[0]
		const controllerName = (req.params.controller.match(/^[a-zA-Z0-9_-]+$/) || [])[0]
		const method = (req.params.method.match(/^[a-zA-Z0-9]+$/) || [])[0]

		if (!version || !controllerName || !method) {
			throw new Error('Invalid path parameters')
		}

		require(`@validators/${version}/${controllerName}`)[method](req)
	} catch (error) {
		next(error)
	}
}
