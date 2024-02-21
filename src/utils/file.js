const moment = require('moment-timezone')
const fs = require('fs')
const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

const clearFile = (filePath) => {
	fs.unlink(filePath, (err) => {
		if (err) logger.error(err)
	})
}

const generateFileName = (name, extension) => {
	const currentDate = new Date()
	const fileExtensionWithTime = moment(currentDate).tz('Asia/Kolkata').format('YYYY_MM_DD_HH_mm') + extension
	return name + fileExtensionWithTime
}

function extractFilename(fileString) {
	const match = fileString.match(/([^/]+)(?=\.\w+$)/)
	return match ? match[0] : null
}

function generateCSVContent(data) {
	// If data is empty
	if (data.length === 0) {
		return 'No Data Found'
	}
	const headers = Object.keys(data[0])
	return [
		headers.join(','),
		...data.map((row) => headers.map((fieldName) => JSON.stringify(row[fieldName])).join(',')),
	].join('\n')
}

const file = { clearFile, generateFileName, extractFilename, generateCSVContent }

module.exports = file
