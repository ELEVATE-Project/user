/**
 * name : validators/v1/profile.js
 * author : Aman Gupta
 * Date : 01-Nov-2021
 * Description : Validations of profiles controller
 */

module.exports = {
	update: (req) => {
		if (req.body.preferredLanguage) {
			req.checkBody('preferredLanguage')
				.trim()
				.isIn(['en', 'hi'])
				.withMessage('Language is invalid, must be either en or hi')
		} else {
			req.checkBody('gender')
				.trim()
				.optional()
				.isIn(['MALE', 'FEMALE', 'OTHER'])
				.withMessage('gender is invalid, must be either MALE, FEMALE or OTHER')

			req.checkBody('name').trim().notEmpty().withMessage('name field is empty')

			req.checkBody('designation')
				.notEmpty()
				.withMessage('designation field is empty')
				.isArray()
				.withMessage('designation is invalid')

			req.checkBody('location')
				.notEmpty()
				.withMessage('location field is empty')
				.isArray()
				.withMessage('location is invalid')

			req.checkBody('about').trim().notEmpty().withMessage('about field is empty')

			req.checkBody('areasOfExpertise')
				.notEmpty()
				.withMessage('areasOfExpertise field is empty')
				.isArray()
				.withMessage('areasOfExpertise is invalid')

			req.checkBody('experience')
				.trim()
				.notEmpty()
				.withMessage('experience field is empty')
				.isFloat()
				.withMessage('experience is invalid')

			req.checkBody('educationQualification')
				.optional()
				.trim()
				.notEmpty()
				.withMessage('Education Qualification field is empty')

			req.checkBody('hasAcceptedTAndC').optional().isBoolean().withMessage('hasAcceptedTAndC field is invalid')

			req.checkBody('image').optional().isString().withMessage('image field must be string only')
		}
	},

	details: (req) => {},

	share: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty').isMongoId().withMessage('id is invalid')
	},
}
