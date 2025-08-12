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
	const specialChars = /[<>{}()'"\\]/ // More specific special chars pattern
	return specialChars.test(str)
}

module.exports = (req, res, next) => {
	req.pageNo = req.query.page && Number(req.query.page) > 0 ? Number(req.query.page) : 1

	req.pageSize =
		req.query.limit && Number(req.query.limit) > 0 && Number(req.query.limit) <= 100 ? Number(req.query.limit) : 100

	req.searchText = req.query.search && req.query.search != '' ? decodeURI(req.query.search).trim() : ''

	if (req.searchText.length > 100) {
		throw responses.failureResponse({
			message: 'Search text too long',
			statusCode: httpStatus.bad_request,
			responseCode: 'CLIENT_ERROR',
		})
	}

	if (containsSpecialChars(req.searchText)) {
		throw responses.failureResponse({
			message: 'Invalid search text',
			statusCode: httpStatus.bad_request,
			responseCode: 'CLIENT_ERROR',
		})
	}

	delete req.query.page
	delete req.query.limit
	delete req.query.search
	next()
}
