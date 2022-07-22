/**
 * name : utils.js
 * author : Aman
 * created-date : 04-Nov-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs')
const { AwsFileHelper, GcpFileHelper, AzureFileHelper } = require('files-cloud-storage')
const momentTimeZone = require('moment-timezone')
const moment = require('moment')
const path = require('path')
const md5 = require('md5')
const { RedisHelper, InternalCache } = require('elevate-node-cache')

const hash = (str) => {
	const salt = bcryptJs.genSaltSync(10)
	let hashstr = bcryptJs.hashSync(str, salt)
	return hashstr
}

const elapsedMinutes = (date1, date2) => {
	var difference = date1 - date2
	let result = difference / 60000
	return result
}

const getIstDate = () => {
	return new Date(new Date().getTime() + (5 * 60 + 30) * 60000)
}

const getCurrentMonthRange = () => {
	const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
	let month = new Date().getMonth()
	const year = new Date().getFullYear()
	let dayInMonth = monthDays[month]
	if (month === 1 && year % 4 === 0) {
		// Feb for leap year
		dayInMonth = 29
	}
	month += 1
	month = month < 10 ? '0' + month : month
	return [new Date(`${year}-${month}-01`), new Date(`${year}-${month}-${dayInMonth}`)]
}

const getCurrentWeekRange = () => {
	const currentDate = new Date().getTime() // in ms
	const currentDay = new Date().getDay() * 24 * 60 * 60 * 1000 // in ms
	const firstDay = currentDate - currentDay
	const lastDay = firstDay + 6 * 24 * 60 * 60 * 1000
	return [new Date(firstDay), new Date(lastDay)]
}

const getCurrentQuarterRange = () => {
	const today = new Date()
	const quarter = Math.floor(today.getMonth() / 3)
	const startFullQuarter = new Date(today.getFullYear(), quarter * 3, 1)
	const endFullQuarter = new Date(startFullQuarter.getFullYear(), startFullQuarter.getMonth() + 3, 0)
	return [startFullQuarter, endFullQuarter]
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

const getTimeZone = (date, format, tz = null) => {
	let timeZone = moment(date)
	if (tz) {
		timeZone.tz(tz)
	}
	timeZone = moment(timeZone).format(format)
	return timeZone
}

const utcFormat = () => {
	return momentTimeZone().utc().format('YYYY-MM-DDTHH:mm:ss')
}

/**
 * md5 hash
 * @function
 * @name md5Hash
 * @returns {String} returns uuid.
 */

function md5Hash(value) {
	return md5(value)
}

function compareVersion(dbValue, apiValue) {
	if (dbValue == apiValue) {
		return false
	} else {
		dbValue = dbValue.split('.')
		apiValue = apiValue.split('.')
		for (let i = 0; i < dbValue.length; i++) {
			if (dbValue[i] > apiValue[i]) {
				return false
			}
		}
		return true
	}
}

function internalSet(key, value) {
	return InternalCache.setKey(key, value)
}
function internalGet(key) {
	return InternalCache.getKey(key)
}
function internalDel(key) {
	return InternalCache.delKey(key)
}

function redisSet(key, value, exp) {
	return RedisHelper.setKey(key, value, exp)
}
function redisGet(key) {
	return RedisHelper.getKey(key)
}
function redisDel(key) {
	return RedisHelper.deleteKey(key)
}

module.exports = {
	hash: hash,
	getCurrentMonthRange: getCurrentMonthRange,
	getCurrentWeekRange: getCurrentWeekRange,
	getCurrentQuarterRange: getCurrentQuarterRange,
	elapsedMinutes: elapsedMinutes,
	getIstDate: getIstDate,
	composeEmailBody: composeEmailBody,
	getDownloadableUrl: getDownloadableUrl,
	getTimeZone,
	utcFormat: utcFormat,
	md5Hash: md5Hash,
	compareVersion: compareVersion,
	internalSet: internalSet,
	internalDel: internalDel,
	internalGet: internalGet,
	redisSet: redisSet,
	redisGet: redisGet,
	redisDel: redisDel,
}
