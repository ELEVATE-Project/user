/**
 * name : utils.js
 * author : Aman
 * created-date : 07-Oct-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const path = require('path')
const { AwsFileHelper, GcpFileHelper, AzureFileHelper } = require('files-cloud-storage')

const generateToken = (tokenData, secretKey, expiresIn) => {
	return jwt.sign(tokenData, secretKey, { expiresIn })
}

const hashPassword = (password) => {
	const salt = bcryptJs.genSaltSync(10)
	let hashPassword = bcryptJs.hashSync(password, salt)
	return hashPassword
}

const comparePassword = (password1, password2) => {
	return bcryptJs.compareSync(password1, password2)
}

const clearFile = (filePath) => {
	fs.unlink(filePath, (err) => {
		if (err) console.log(err)
	})
}

const composeEmailBody = (body, params) => {
	return body.replace(/{([^{}]*)}/g, (a, b) => {
		var r = params[b]
		return typeof r === 'string' || typeof r === 'number' ? r : a
	})
}

const getDownloadableUrl = async (imgPath) => {
	if (process.env.CLOUD_STORAGE === 'GCP') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_GCP_BUCKET_NAME,
			gcpProjectId: process.env.GCP_PROJECT_ID,
			gcpJsonFilePath: path.join(__dirname, '../', process.env.GCP_PATH),
		}
		imgPath = await GcpFileHelper.getDownloadableUrl(options)
	} else if (process.env.CLOUD_STORAGE === 'AWS') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_AWS_BUCKET_NAME,
			bucketRegion: process.env.AWS_BUCKET_REGION,
		}
		imgPath = await AwsFileHelper.getDownloadableUrl(options.destFilePath, options.bucketName, options.bucketRegion)
	} else if (process.env.CLOUD_STORAGE === 'AZURE') {
		const options = {
			destFilePath: imgPath,
			containerName: process.env.DEFAULT_AZURE_CONTAINER_NAME,
			expiry: 30,
			actionType: 'rw',
			accountName: process.env.AZURE_ACCOUNT_NAME,
			accountKey: process.env.AZURE_ACCOUNT_KEY,
		}
		imgPath = await AzureFileHelper.getDownloadableUrl(options)
	}
	return imgPath
}

module.exports = {
	generateToken,
	hashPassword,
	comparePassword,
	clearFile,
	composeEmailBody,
	getDownloadableUrl,
}
