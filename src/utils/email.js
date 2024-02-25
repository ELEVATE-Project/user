const composeEmailBody = (body, params) => {
	return body.replace(/{([^{}]*)}/g, (a, b) => {
		var r = params[b]
		return typeof r === 'string' || typeof r === 'number' ? r : a
	})
}
const extractDomainFromEmail = (email) => {
	return email.substring(email.lastIndexOf('@') + 1)
}

const email = { composeEmailBody, extractDomainFromEmail }

module.exports = email
