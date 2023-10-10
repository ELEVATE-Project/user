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
const { AwsFileHelper, GcpFileHelper, AzureFileHelper, OciFileHelper } = require('elevate-cloud-storage')
const { RedisCache, InternalCache } = require('elevate-node-cache')
const md5 = require('md5')
const crypto = require('crypto')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()
const algorithm = 'aes-256-cbc'
const moment = require('moment-timezone')

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
		if (err) logger.error(err)
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

const validateRoleAccess = (roles, requiredRole) => {
	return roles.some((role) => role.title == requiredRole)
}

const generateFileName = (name, extension) => {
	const currentDate = new Date()
	const fileExtensionWithTime = moment(currentDate).tz('Asia/Kolkata').format('YYYY_MM_DD_HH_mm') + extension
	return name + fileExtensionWithTime
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
function isNumeric(value) {
	return /^\d+$/.test(value)
}

function extractFilename(fileString) {
	const match = fileString.match(/([^/]+)(?=\.\w+$)/)
	return match ? match[0] : null
}

function extractDomainFromEmail(email) {
	return email.substring(email.lastIndexOf('@') + 1)
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
	const customEntities = {}
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
							customEntities.custom_entity_text = {
								...(customEntities.custom_entity_text || {}),
								[requestBodyKey]: { value: 'other', label: value },
							}

							// Add the value to customValues to remove it later
							customValues.push(value)
						}
					}

					if (customValues.length > 0) {
						// Remove customValues from the original array
						requestBody[requestBodyKey] = requestBody[requestBodyKey].filter(
							(value) => !customValues.includes(value)
						)
					}
				}
			}
			if (Array.isArray(requestBodyValue)) {
				for (const value of requestBodyValue) {
					const entityTypeExists = entityData.find((entity) => entity.value === value)
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
	}

	// Merge customEntities into requestBody
	Object.assign(requestBody, customEntities)

	return requestBody
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
				.filter((entity) => output[key].includes(entity.value))
				.map((entity) => ({
					value: entity.value,
					label: entity.label,
				}))
			output[key] = matchingValues
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
	for (const key in data.custom_entity_text) {
		data[key] = [...data[key], data.custom_entity_text[key]]
	}
	delete data.custom_entity_text
	return data
}
function removeParentEntityTypes(data) {
	const parentIds = data.filter((item) => item.parent_id !== null).map((item) => item.parent_id)
	return data.filter((item) => !parentIds.includes(item.id))
}
module.exports = {
	generateToken,
	hashPassword,
	comparePassword,
	clearFile,
	composeEmailBody,
	getDownloadableUrl,
	md5Hash,
	validateRoleAccess,
	generateFileName,
	internalSet: internalSet,
	internalDel: internalDel,
	internalGet: internalGet,
	redisSet: redisSet,
	redisGet: redisGet,
	redisDel: redisDel,
	isNumeric: isNumeric,
	extractFilename: extractFilename,
	extractDomainFromEmail: extractDomainFromEmail,
	processDbResponse,
	restructureBody,
	validateInput,
	removeParentEntityTypes,
}
