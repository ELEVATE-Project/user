/**
 * name : validators/phoneValidation.js
 * Description : Shared phone validation used across account/org-admin/tenant/user
 *                validators - phone must be digits-only (length left to the UI)
 *                and is only ever encrypted/stored together with phone_code.
 */
module.exports = function validatePhoneWithCode(req) {
	req.checkBody('phone')
		.optional()
		.trim()
		.matches(/^[0-9]+$/)
		.withMessage('phone must contain only numbers')

	req.checkBody(['phone', 'phone_code']).custom(() => {
		if (req.body.phone && !req.body.phone_code) {
			throw new Error('phone_code is required when phone is provided')
		}
		return true
	})
}
