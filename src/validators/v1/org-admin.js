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
		// Validate incoming request body
		req.checkBody('session_visibility_policy').notEmpty().withMessage('session_visibility_policy field is empty')
		req.checkBody('mentor_visibility_policy').notEmpty().withMessage('mentor_visibility_policy field is empty')
		req.checkBody('external_session_visibility_policy')
			.notEmpty()
			.withMessage('external_session_visibility_policy field is empty')
		req.checkBody('external_mentor_visibility_policy')
			.notEmpty()
			.withMessage('external_mentor_visibility_policy field is empty')
		req.checkBody('allow_mentor_override').notEmpty().withMessage('allow_mentor_override field is empty')
	},
	updateOrganization: (req) => {
		req.checkBody('user_id').notEmpty().withMessage('user_id field is empty')
		req.checkBody('org_id').notEmpty().withMessage('org_id field is empty')
		req.checkBody('roles').notEmpty().withMessage('roles field is empty')
	},
	deactivateUpcomingSession: (req) => {
		req.checkQuery('user_id').notEmpty().withMessage('user_id field is empty')
	},
}
