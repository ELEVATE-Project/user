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
	let timeZone = typeof date === 'number' || !isNaN(date) ? moment.unix(date) : moment(date)

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

		if (modelName && !field.model_names.includes(modelName) && input[field.value]) {
			errors.push({
				param: field.value,
				msg: `${field.value} is not allowed for the ${modelName} model.`,
			})
		}

		if (!fieldValue || field.allow_custom_entities === true || field.has_entities === false) {
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

const entityTypeMapGenerator = (entityTypeData) => {
	try {
		const entityTypeMap = new Map()
		entityTypeData.forEach((entityType) => {
			const labelsMap = new Map()
			const entities = entityType.entities.map((entity) => {
				labelsMap.set(entity.value, entity.label)
				return entity.value
			})
			if (!entityTypeMap.has(entityType.value)) {
				const entityMap = new Map()
				entityMap.set('allow_custom_entities', entityType.allow_custom_entities)
				entityMap.set('entities', new Set(entities))
				entityMap.set('labels', labelsMap)
				entityTypeMap.set(entityType.value, entityMap)
			}
		})
		return entityTypeMap
	} catch (err) {
		console.log(err)
	}
}

function restructureBody(requestBody, entityData, allowedKeys) {
	try {
		const entityTypeMap = entityTypeMapGenerator(entityData)
		const doesAffectedFieldsExist = Object.keys(requestBody).some((element) => entityTypeMap.has(element))
		// if request body doesn't have field to restructure break the operation return requestBody
		if (!doesAffectedFieldsExist) return requestBody
		// add object custom_entity_text to request body
		requestBody.custom_entity_text = {}
		// If request body does not contain meta add meta object
		if (!requestBody.meta) requestBody.meta = {}
		// Iterate through each key in request body
		for (const currentFieldName in requestBody) {
			// store corrent key's value
			const currentFieldValue = requestBody[currentFieldName]
			// Get entity type maped to corrent data
			const entityType = entityTypeMap.get(currentFieldName)
			// Check if the current data have any entity type associated with and if allow_custom_entities= true enter to if case
			if (entityType && entityType.get('allow_custom_entities')) {
				// If current field value is of type Array enter to this if condition
				if (Array.isArray(currentFieldValue)) {
					const recognizedEntities = []
					const customEntities = []
					// Iterate though corrent fileds value of type Array
					for (const value of currentFieldValue) {
						// If entity has entities which matches value push the data into recognizedEntities array
						// Else push to customEntities as { value: 'other', label: value }
						if (entityType.get('entities').has(value)) recognizedEntities.push(value)
						else customEntities.push({ value: 'other', label: value })
					}
					// If wehave data in recognizedEntities
					if (recognizedEntities.length > 0)
						if (allowedKeys.includes(currentFieldName))
							// If the current field have a concrete column in db assign recognizedEntities to requestBody[currentFieldName]
							// Else add that into meta
							requestBody[currentFieldName] = recognizedEntities
						else requestBody.meta[currentFieldName] = recognizedEntities
					if (customEntities.length > 0) {
						requestBody[currentFieldName].push('other') //This should cause error at DB write
						requestBody.custom_entity_text[currentFieldName] = customEntities
					}
				} else {
					if (!entityType.get('entities').has(currentFieldValue)) {
						requestBody.custom_entity_text[currentFieldName] = {
							value: 'other',
							label: currentFieldValue,
						}
						if (allowedKeys.includes(currentFieldName))
							requestBody[currentFieldName] = 'other' //This should cause error at DB write
						else requestBody.meta[currentFieldName] = 'other'
					} else if (!allowedKeys.includes(currentFieldName))
						requestBody.meta[currentFieldName] = currentFieldValue
				}
			}

			if (entityType && !entityType.get('allow_custom_entities') && !entityType.get('has_entities')) {
				// check allow = false has entiy false
				if (!allowedKeys.includes(currentFieldName))
					requestBody.meta[currentFieldName] = requestBody[currentFieldName]
			}
		}
		if (Object.keys(requestBody.meta).length === 0) requestBody.meta = null
		if (Object.keys(requestBody.custom_entity_text).length === 0) requestBody.custom_entity_text = null
		return requestBody
	} catch (error) {
		console.error(error)
	}
}

function processDbResponse(responseBody, entityType) {
	// Check if the response body has a "meta" property
	if (responseBody.meta) {
		entityType.forEach((entity) => {
			const entityTypeValue = entity.value
			if (responseBody?.meta?.hasOwnProperty(entityTypeValue)) {
				// Move the key from responseBody.meta to responseBody root level
				responseBody[entityTypeValue] = responseBody.meta[entityTypeValue]
				// Delete the key from responseBody.meta
				delete responseBody.meta[entityTypeValue]
			}
		})
	}

	const output = { ...responseBody } // Create a copy of the responseBody object
	// Iterate through each key in the output object
	for (const key in output) {
		// Check if the key corresponds to an entity type and is not null
		if (entityType.some((entity) => entity.value === key) && output[key] !== null) {
			// Find the matching entity type for the current key
			const matchingEntity = entityType.find((entity) => entity.value === key)
			// Filter and map the matching entity values
			const matchingValues = matchingEntity.entities
				.filter((entity) => (Array.isArray(output[key]) ? output[key].includes(entity.value) : true))
				.map((entity) => ({
					value: entity.value,
					label: entity.label,
				}))
			// Check if there are matching values
			if (matchingValues.length > 0) {
				output[key] = Array.isArray(output[key]) ? matchingValues : matchingValues[0]
			} else if (Array.isArray(output[key])) {
				output[key] = output[key].map((item) => {
					if (item.value && item.label) return item
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
		if (Array.isArray(data[key])) data[key] = [...data[key], ...data.custom_entity_text[key]]
		else data[key] = data.custom_entity_text[key]
	}
	delete data.custom_entity_text

	// Check if the response body has a "meta" property
	if (data.meta && Object.keys(data.meta).length > 0) {
		// Merge properties of data.meta into the top level of data
		Object.assign(data, data.meta)
		// Remove the "meta" property from the output
		delete output.meta
	}

	return data
}

function removeParentEntityTypes(data) {
	const parentIds = data.filter((item) => item.parent_id !== null).map((item) => item.parent_id)
	return data.filter((item) => !parentIds.includes(item.id))
}
const epochFormat = (date, format) => {
	return moment.unix(date).utc().format(format)
}
function processQueryParametersWithExclusions(query) {
	const queryArrays = {}
	const excludedKeys = common.excludedQueryParams
	for (const queryParam in query) {
		if (query.hasOwnProperty(queryParam) && !excludedKeys.includes(queryParam)) {
			queryArrays[queryParam] = query[queryParam].split(',').map((item) => item.trim())
		}
	}

	return queryArrays
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

	// Check the type of the first element.
	const firstElementType = typeof roles[0]
	if (firstElementType === 'object') {
		return roles.some((role) => requiredRoles.includes(role.title))
	} else {
		return roles.some((role) => requiredRoles.includes(role))
	}
}

const removeDefaultOrgEntityTypes = (entityTypes, orgId) => {
	const entityTypeMap = new Map()
	entityTypes.forEach((entityType) => {
		if (!entityTypeMap.has(entityType.value)) entityTypeMap.set(entityType.value, entityType)
		else if (entityType.organization_id === orgId) entityTypeMap.set(entityType.value, entityType)
	})
	return Array.from(entityTypeMap.values())
}
const generateWhereClause = (tableName) => {
	let whereClause = ''

	switch (tableName) {
		case 'sessions':
			const currentEpochDate = Math.floor(new Date().getTime() / 1000) // Get current date in epoch format
			whereClause = `deleted_at IS NULL AND start_date >= ${currentEpochDate}`
			break
		case 'mentor_extensions':
			whereClause = `deleted_at IS NULL`
			break
		case 'user_extensions':
			whereClause = `deleted_at IS NULL`
			break
		default:
			whereClause = 'deleted_at IS NULL'
	}

	return whereClause
}

function validateFilters(input, validationData, modelName) {
	const allValues = []
	validationData.forEach((item) => {
		// Extract the 'value' property from the main object
		allValues.push(item.value)

		// Extract the 'value' property from the 'entities' array
	})

	for (const key in input) {
		if (input.hasOwnProperty(key)) {
			if (allValues.includes(key)) {
				continue
			} else {
				delete input[key]
			}
		}
	}
	return input
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
	generateWhereClause,
	validateFilters,
	processQueryParametersWithExclusions,
}
