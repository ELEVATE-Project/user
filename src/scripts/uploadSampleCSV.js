/**
 * name : uploadSampleCSV.js
 * author : Priyanka Pradeep
 * created-date : 02-Nov-2023
 * Description : script to upload the sample csv for bulk upload.
 */
require('module-alias/register')
const fs = require('fs')
require('dotenv').config({ path: '../.env' })
const path = require('path')
const fileService = require('../services/files')
const request = require('request')
const common = require('../constants/common')

;(async () => {
	try {
		const fileName = 'sample.csv'
		const filePath = path.join(__dirname, '../', fileName)

		//check file exist
		fs.access(filePath, fs.constants.F_OK, (err) => {
			if (err) {
				console.error('The file does not exist in the folder.')
			} else {
				console.log('The file exists in the folder.')
			}
		})

		const uploadFilePath = process.env.SAMPLE_CSV_FILE_PATH
		const uploadFolder = path.dirname(uploadFilePath)
		const uploadFileName = path.basename(uploadFilePath)

		//get signed url
		const getSignedUrl = await fileService.getSignedUrl(uploadFileName, '', uploadFolder, false)

		if (!getSignedUrl.result) {
			throw new Error('FAILED_TO_GENERATE_SIGNED_URL')
		}

		const fileUploadUrl = getSignedUrl.result.signedUrl

		const fileData = fs.readFileSync(filePath, 'utf-8')

		//upload file
		await request({
			url: fileUploadUrl,
			method: 'put',
			headers: {
				'x-ms-blob-type': common.azureBlobType,
				'Content-Type': 'multipart/form-data',
			},
			body: fileData,
		})

		console.log('file path: ' + getSignedUrl.result.filePath)
		console.log('completed')
	} catch (error) {
		console.log(error)
	}
})().catch((err) => console.error(err))
