/**
 * name : pagination.js
 * author : Aman Karki
 * Date : 13-July-2020
 * Description : Pagination
 */
const common = require('@constants/common')
const httpStatus = require('@generics/http-status')
const responses = require('@helpers/responses')
function containsSpecialChars(str) {
	const specialChars = /[`!#$%^&*()_+\-=\[\]{};':"\\|<>\/?~]/
	return specialChars.test(str)
}
module.exports = (req, res, next) => {
	req.pageNo = req.query.page && Number(req.query.page) > 0 ? Number(req.query.page) : 1

	req.pageSize =
		req.query.limit && Number(req.query.limit) > 0 && Number(req.query.limit) <= 100 ? Number(req.query.limit) : 100

	req.searchText = req.query.search && req.query.search != '' ? decodeURI(req.query.search) : ''
	/* let buff = new Buffer(req.searchText, 'base64')
	req.searchText = buff.toString('ascii') */
	if (containsSpecialChars(req.searchText)) {
		throw responses.failureResponse({
			message: 'Invalid search text',
			statusCode: httpStatus.bad_request,
			responseCode: 'CLIENT_ERROR',
		})
	} else {
		delete req.query.page
		delete req.query.limit
		next()
		return
	}
}
