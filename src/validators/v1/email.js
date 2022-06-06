module.exports = {
	send: (req) => {
		req.checkBody('type')
			.trim()
			.notEmpty()
			.withMessage('email field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')


		req.checkBody('email.to').notEmpty().withMessage("email field is empty")
			.custom(emailIds =>
				emailValidation(emailIds)
			).withMessage("invalid email ids");

	}


}

function emailValidation(emailIds) {
	let isEmailValid = true;
	let emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	let emails = emailIds.split(",");
	
	if (Array.isArray(emails)) {
		for (var i = 0; emails.length > i; i++) {
			let valid = emailRegex.test(emails[i]);

			if (!valid) {
				isEmailValid = false;
				return;
			}
		}
	}

	return isEmailValid;

}