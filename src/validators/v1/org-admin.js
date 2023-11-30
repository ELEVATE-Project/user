/**
 * name : validators/v1/org-admin.js
 * author : Vishnu
 * Date : 05-Oct-2023
 * Description : Validations of org-admin controller
 */

module.exports = {
	roleChange: (req) => {
		// Validate incoming request body
		req.checkBody('user_id').notEmpty().withMessage('user_id field is empty')
		req.checkBody('current_roles').notEmpty().withMessage('current_roles field is empty')
		req.checkBody('new_roles').notEmpty().withMessage('new_roles field is empty')
	},
	inheritEntityType: (req) => {
		// Validate incoming request body
		req.checkBody('entity_type_value').notEmpty().withMessage('entity_type_value field is empty')
		req.checkBody('target_entity_type_label').notEmpty().withMessage('target_entity_type_label field is empty')
	},

	setOrgPolicies: (req) => {
		const allowedPolicies = ['CURRENT', 'ALL', 'ASSOCIATED']

		// Validate incoming request body
		req.checkBody('session_visibility_policy')
			.notEmpty()
			.withMessage('session_visibility_policy field is empty')
			.isIn(allowedPolicies)
			.withMessage('Invalid session_visibility_policy value')

		req.checkBody('mentor_visibility_policy')
			.notEmpty()
			.withMessage('mentor_visibility_policy field is empty')
			.isIn(allowedPolicies)
			.withMessage('Invalid mentor_visibility_policy value')

		req.checkBody('external_session_visibility_policy')
			.notEmpty()
			.withMessage('external_session_visibility_policy field is empty')
			.isIn(allowedPolicies)
			.withMessage('Invalid external_session_visibility_policy value')

		req.checkBody('external_mentor_visibility_policy')
			.notEmpty()
			.withMessage('external_mentor_visibility_policy field is empty')
			.isIn(allowedPolicies)
			.withMessage('Invalid external_mentor_visibility_policy value')

		req.checkBody('allow_mentor_override')
			.notEmpty()
			.withMessage('allow_mentor_override field is empty')
			.isBoolean()
			.withMessage('allow_mentor_override must be a boolean')
	},

	updateOrganization: (req) => {
		req.checkBody('user_id').notEmpty().withMessage('user_id field is empty')
		req.checkBody('organization_id').notEmpty().withMessage('organization_id field is empty')
		req.checkBody('roles').notEmpty().withMessage('roles field is empty')
	},
	deactivateUpcomingSession: (req) => {
		req.checkBody('user_ids')
			.notEmpty()
			.withMessage('user_ids field is empty')
			.isArray()
			.withMessage('user_ids must be an array')
	},
	updateRelatedOrgs: (req) => {
		req.checkBody('related_organization_ids').notEmpty().withMessage('related_organization_ids field is empty')
		req.checkBody('organization_id').notEmpty().withMessage('organization_id field is empty')
	},
}
