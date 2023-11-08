/**
 * name : utils.js
 * author : Aman
 * created-date : 04-Nov-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs')
const { AwsFileHelper, GcpFileHelper, AzureFileHelper, OciFileHelper } = require('elevate-cloud-storage')
const momentTimeZone = require('moment-timezone')
const moment = require('moment')
const path = require('path')
const md5 = require('md5')
const { RedisCache, InternalCache } = require('elevate-node-cache')
const startCase = require('lodash/startCase')
const common = require('@constants/common')
const crypto = require('crypto')

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

const extractEmailTemplate = (input, conditions) => {
	const allConditionsRegex = /{{(.*?)}}(.*?){{\/\1}}/g
	let result = input

	for (const match of input.matchAll(allConditionsRegex)) {
		result = conditions.includes(match[1]) ? result.replace(match[0], match[2]) : result.replace(match[0], '')
	}

	return result
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
	} else if (process.env.CLOUD_STORAGE === 'OCI') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_OCI_BUCKET_NAME,
			endpoint: process.env.OCI_BUCKET_ENDPOINT,
		}
		imgPath = await OciFileHelper.getDownloadableUrl(options)
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
	return RedisCache.setKey(key, value, exp)
}
function redisGet(key) {
	return RedisCache.getKey(key)
}
function redisDel(key) {
	return RedisCache.deleteKey(key)
}
const capitalize = (str) => {
	return startCase(str)
}
const isAMentor = (roles) => {
	return roles.some((role) => role.title == common.MENTOR_ROLE)
}
function isNumeric(value) {
	return /^\d+$/.test(value)
}

function validateInput(input, validationData, modelName) {
	const errors = []
	for (const field of validationData) {
		const fieldValue = input[field.value]
		//console.log('fieldValue', field.allow_custom_entities)
		if (!fieldValue || field.allow_custom_entities === true) {
			continue // Skip validation if the field is not present in the input or allow_custom_entities is true
		}

		if (Array.isArray(fieldValue)) {
			for (const value of fieldValue) {
				if (!field.entities.some((entity) => entity.value === value)) {
					errors.push({
						param: field.value,
						msg: `${value} is not a valid entity.`,
					})
				}
			}
		} else if (!field.entities.some((entity) => entity.value === fieldValue)) {
			errors.push({
				param: field.value,
				msg: `${fieldValue} is not a valid entity.`,
			})
		}

		if (modelName && !field.model_names.includes(modelName)) {
			errors.push({
				param: field.value,
				msg: `${field.value} is not allowed for the ${modelName} model.`,
			})
		}
	}

	if (errors.length === 0) {
		return {
			success: true,
			message: 'Validation successful',
		}
	}

	return {
		success: false,
		errors: errors,
	}
}
function restructureBody(requestBody, entityData, allowedKeys) {
	try {
		const requestBodyKeys = Object.keys(requestBody)

		const entityValues = entityData.map((entity) => entity.value)

		const requestBodyKeysExists = requestBodyKeys.some((element) => entityValues.includes(element))

		if (!requestBodyKeysExists) {
			return requestBody
		}
		const customEntities = {}
		requestBody.custom_entity_text = {}
		for (const requestBodyKey in requestBody) {
			if (requestBody.hasOwnProperty(requestBodyKey)) {
				const requestBodyValue = requestBody[requestBodyKey]
				const entityType = entityData.find((entity) => entity.value === requestBodyKey)

				if (entityType && entityType.allow_custom_entities) {
					if (Array.isArray(requestBodyValue)) {
						const customValues = []

						for (const value of requestBodyValue) {
							const entityExists = entityType.entities.find((entity) => entity.value === value)

							if (!entityExists) {
								customEntities.custom_entity_text = customEntities.custom_entity_text || {}
								customEntities.custom_entity_text[requestBodyKey] =
									customEntities.custom_entity_text[requestBodyKey] || []
								customEntities.custom_entity_text[requestBodyKey].push({
									value: 'other',
									label: value,
								})
								customValues.push(value)
							}
						}

						if (customValues.length > 0) {
							// Remove customValues from the original array
							requestBody[requestBodyKey] = requestBody[requestBodyKey].filter(
								(value) => !customValues.includes(value)
							)
						}
						for (const value of requestBodyValue) {
							const entityExists = entityType.entities.find((entity) => entity.value === value)

							if (!entityExists) {
								if (!requestBody[requestBodyKey].includes('other')) {
									requestBody[requestBodyKey].push('other')
								}
							}
						}
					}
				}

				if (Array.isArray(requestBodyValue)) {
					const entityTypeExists = entityData.find((entity) => entity.value === requestBodyKey)

					// Always move the key to the meta field if it's not allowed and is not a custom entity
					if (!allowedKeys.includes(requestBodyKey) && entityTypeExists) {
						requestBody.meta = {
							...(requestBody.meta || {}),
							[requestBodyKey]: requestBody[requestBodyKey],
						}
						delete requestBody[requestBodyKey]
					}
				}
			}
		}
		// Merge customEntities into requestBody
		Object.assign(requestBody, customEntities)
		return requestBody
	} catch (error) {
		console.error(error)
	}
}

function processDbResponse(session, entityType) {
	if (session.meta) {
		entityType.forEach((entity) => {
			const entityTypeValue = entity.value
			if (session?.meta?.hasOwnProperty(entityTypeValue)) {
				// Move the key from session.meta to session root level
				session[entityTypeValue] = session.meta[entityTypeValue]
				// Delete the key from session.meta
				delete session.meta[entityTypeValue]
			}
		})
	}

	const output = { ...session } // Create a copy of the session object

	for (const key in output) {
		if (entityType.some((entity) => entity.value === key) && output[key] !== null) {
			const matchingEntity = entityType.find((entity) => entity.value === key)
			const matchingValues = matchingEntity.entities
				.filter((entity) => (Array.isArray(output[key]) ? output[key].includes(entity.value) : false))
				.map((entity) => ({
					value: entity.value,
					label: entity.label,
				}))
			if (matchingValues.length > 0) {
				output[key] = matchingValues
			} else if (Array.isArray(output[key])) {
				output[key] = output[key].map((item) => {
					if (item.value && item.label) {
						return item
					}
					return {
						value: item,
						label: item,
					}
				})
			}
		}

		if (output.meta && output.meta[key] && entityType.some((entity) => entity.value === output.meta[key].value)) {
			const matchingEntity = entityType.find((entity) => entity.value === output.meta[key].value)
			output.meta[key] = {
				value: matchingEntity.value,
				label: matchingEntity.label,
			}
		}
	}

	const data = output

	// Merge "custom_entity_text" into the respective arrays
	for (const key in data.custom_entity_text) {
		if (Array.isArray(data[key])) {
			data[key] = [...data[key], ...data.custom_entity_text[key]]
		} else {
			data[key] = data.custom_entity_text[key]
		}
	}

	delete data.custom_entity_text
	return data
}

function removeParentEntityTypes(data) {
	const parentIds = data.filter((item) => item.parent_id !== null).map((item) => item.parent_id)
	return data.filter((item) => !parentIds.includes(item.id))
}
const epochFormat = (date, format) => {
	return moment.unix(date).utc().format(format)
}

/**
 * Calculate the time difference in milliseconds between a current date
 * and a modified date obtained by subtracting a specified time value and unit from startDate.
 *
 * @param {string} startDate - The start date.
 * @param {number} timeValue - The amount of time to subtract.
 * @param {string} timeUnit - The unit of time to subtract (e.g., 'hours', 'days').
 * @returns {number} The time difference in milliseconds.
 */
function getTimeDifferenceInMilliseconds(startDate, timeValue, timeUnit) {
	// Get current date
	const currentUnixTimestamp = moment().unix()

	// Subtract the specified time value and unit
	const modifiedDate = moment.unix(startDate).subtract(timeValue, timeUnit).unix()

	// Calculate the duration and get the time difference in milliseconds
	const duration = moment.duration(moment.unix(modifiedDate).diff(moment.unix(currentUnixTimestamp)))

	return duration.asMilliseconds()
}

function deleteProperties(obj, propertiesToDelete) {
	try {
		return Object.keys(obj).reduce((result, key) => {
			if (!propertiesToDelete.includes(key)) {
				result[key] = obj[key]
			}
			return result
		}, {})
	} catch (error) {
		return obj
	}
}
/**
 * Generate security checksum.
 * @method
 * @name generateCheckSum
 * @param {String} queryHash - Query hash.
 * @returns {Number} - checksum key.
 */

function generateCheckSum(queryHash) {
	var shasum = crypto.createHash('sha1')
	shasum.update(queryHash)
	const checksum = shasum.digest('hex')
	return checksum
}
/**
 * validateRoleAccess.
 * @method
 * @name validateRoleAccess
 * @param {Array} roles - roles array.
 * @param {String} requiredRole - role to check.
 * @returns {Number} - checksum key.
 */

const validateRoleAccess = (roles, requiredRoles) => {
	if (!roles || roles.length === 0) return false

	if (!Array.isArray(requiredRoles)) {
		requiredRoles = [requiredRoles]
	}
	return roles.some((role) => requiredRoles.includes(role))
}

const removeDefaultOrgEntityTypes = (entityTypes, orgId) => {
	const entityTypeMap = new Map()
	entityTypes.forEach((entityType) => {
		if (!entityTypeMap.has(entityType.value)) entityTypeMap.set(entityType.value, entityType)
		else if (entityType.org_id === orgId) entityTypeMap.set(entityType.value, entityType)
	})
	return Array.from(entityTypeMap.values())
}

module.exports = {
	hash: hash,
	getCurrentMonthRange,
	getCurrentWeekRange,
	getCurrentQuarterRange,
	elapsedMinutes,
	getIstDate,
	composeEmailBody,
	getDownloadableUrl,
	getTimeZone,
	utcFormat,
	md5Hash,
	internalSet,
	internalDel,
	internalGet,
	redisSet,
	redisGet,
	redisDel,
	extractEmailTemplate,
	capitalize,
	isAMentor,
	isNumeric,
	epochFormat,
	processDbResponse,
	restructureBody,
	validateInput,
	removeParentEntityTypes,
	getTimeDifferenceInMilliseconds,
	deleteProperties,
	generateCheckSum,
	validateRoleAccess,
	removeDefaultOrgEntityTypes,
}
