/**
 * name : middlewares/validator
 * author : Aman Kumar Gupta
 * Date : 20-Oct-2021
 * Description : Contains logic to call required validator from validators directory to validate request data
 */

module.exports = (req, res, next) => {
	try {
		const version = (req.params.version.match(/^v\d+$/) || [])[0] // Match version like v1, v2, etc.
		const controllerName = (req.params.controller.match(/^[a-zA-Z0-9_-]+$/) || [])[0] // Allow only alphanumeric characters, underscore, and hyphen
		const method = (req.params.method.match(/^[a-zA-Z0-9]+$/) || [])[0] // Allow only alphanumeric characters
		require(`@validators/${version}/${controllerName}`)[method](req)
	} catch {}
	next()
}
