/**
 * name : admin.js
 * author : Nevil Mathew
 * created-date : 21-JUN-2023
 * Description : Admin Controller.
 */

// Dependencies
const userService = require('@services/admin')

module.exports = class admin {
	/**
	 * userDelete
	 * @method
	 * @name userDelete
	 * @param {Object} req -request data.
	 * @param {String} req.query.userId - User Id.
	 * @returns {JSON} - Success Response.
	 */

	async userDelete(req) {
		try {
			const userDelete = await userService.userDelete(req.decodedToken, req.query.userId)
			return userDelete
		} catch (error) {
			return error
		}
	}

	async triggerViewRebuild(req) {
		try {
			const userDelete = await userService.triggerViewRebuild(req.decodedToken, req.query.userId)
			return userDelete
		} catch (error) {
			return error
		}
	}
	async triggerPeriodicViewRefresh(req, res) {
		try {
			const userDelete = await userService.triggerPeriodicViewRefresh(req.decodedToken, req.query.userId)
			return userDelete
			await adminService.triggerPeriodicViewRefresh()
			res.send({ message: 'Triggered' })
		} catch (err) {
			console.log(err)
		}
	}
}
