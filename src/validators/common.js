module.exports = function filterRequestBody(reqBody, blacklist) {
	return Object.fromEntries(Object.entries(reqBody).filter(([key]) => !blacklist.includes(key)))
}
