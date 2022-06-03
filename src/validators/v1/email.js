module.exports = {
	send: (req) => {
		req.checkBody('type')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')

		req.checkBody('email.to')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.isEmail()
			.matches(
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
			.withMessage('email is invalid')
			.normalizeEmail()
	},
}
