const orgAdminService = require('@services/org-admin')

module.exports = class OrgAdmin {
	/**
	 * setOrgPolicies
	 * @method
	 * @name setOrgPolicies
	 * @param {Object} req - Request data.
	 * @param {Object} req.body - Request body containing updated policies.
	 * @param {String} req.body.session_visibility_policy - Session visibility policy.
	 * @param {String} req.body.mentor_visibility_policy - Mentor visibility policy.
	 * @param {String} req.body.external_session_visibility_policy - External session visibility policy.
	 * @param {String} req.body.external_mentor_visibility_policy - External mentor visibility policy.
	 * @param {Array} req.body.is_approval_required - List of approvals required (Irrelevant for now).
	 * @param {Boolean} req.body.allow_mentor_override - Allow mentor override flag.
	 * @returns {JSON} - Success Response.
	 * @throws {Error} - Returns an error if the update fails.
	 */

	async setOrgPolicies(req) {
		try {
			console.log(req.decodedToken)
			console.log(req.body)
			const orgPolicies = await orgAdminService.setOrgPolicies(req.decodedToken, req.body)
			return orgPolicies
		} catch (error) {
			return error
		}
	}

	async getOrgPolicies(req) {
		try {
			//req.decodedToken.organization_id
			const orgPolicies = await orgAdminService.getOrgPolicies(req.decodedToken)
			return orgPolicies
		} catch (error) {
			return error
		}
	}

	/**
	 * @description			- change user role.
	 * @method				- post
	 * @name 				- roleChange
	 * @returns {JSON} 		- user role change details.
	 */

	async roleChange(req) {
		try {
			let changedRoleDetails = await orgAdminService.roleChange(req.body)
			return changedRoleDetails
		} catch (error) {
			return error
		}
	}

	/**
	 * @description			- Inherit entity type.
	 * @method				- post
	 * @name 				- inheritEntityType
	 * @returns {JSON} 		- Inherited entity type details.
	 */

	async inheritEntityType(req) {
		try {
			let entityTypeDetails = await orgAdminService.inheritEntityType(
				req.body.entity_type_value,
				req.body.target_entity_type_label,
				req.decodedToken.organization_id,
				req.decodedToken
			)
			return entityTypeDetails
		} catch (error) {
			return error
		}
	}
}
