module.exports = {
	send: (req) => {
		req.checkBody('type')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')
	},
}
