/**
 * name : org-admin.js
 * author : Vishnu
 * created-date : 06-Oct-2023
 * Description : organization admin related functions.
 */

// Dependencies
const orgAdminService = require('@services/helper/org-admin')

module.exports = class OrgAdmin {
	/**
	 * @description			- change user role.
	 * @method				- post
	 * @name 				- roleChange
	 * @returns {JSON} 		- user role change details.
	 */

	async roleChange(req) {
		try {
			let changedRoleDetails = orgAdminService.roleChange(req.body)
			return changedRoleDetails
		} catch (error) {
			return error
		}
	}
}