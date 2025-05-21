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
const { RedisCache, InternalCache } = require('elevate-node-cache')
const md5 = require('md5')
const crypto = require('crypto')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()
const algorithm = 'aes-256-cbc'
const moment = require('moment-timezone')
const common = require('@constants/common')
const { cloudClient } = require('@configs/cloud-service')
const axios = require('axios')
const _ = require('lodash')

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

const getDownloadableUrl = async (filePath) => {
	let bucketName = process.env.CLOUD_STORAGE_BUCKETNAME
	let expiryInSeconds = parseInt(process.env.SIGNED_URL_EXPIRY_DURATION) || 300
	let updatedExpiryTime = convertExpiryTimeToSeconds(expiryInSeconds)
	let response = await cloudClient.getSignedUrl(bucketName, filePath, updatedExpiryTime, common.READ_ACCESS)
	return Array.isArray(response) ? response[0] : response
}

const getPublicDownloadableUrl = async (bucketName, filePath) => {
	let downloadableUrl = await cloudClient.getDownloadableUrl(bucketName, filePath)
	return downloadableUrl
}
const validateRoleAccess = (roles, requiredRoles) => {
	if (!roles || roles.length === 0) return false

	if (!Array.isArray(requiredRoles)) {
		requiredRoles = [requiredRoles]
	}

	return roles.some((role) => requiredRoles.includes(role.title))
}

const generateFileName = (name, extension) => {
	const currentDate = new Date()
	const fileExtensionWithTime = moment(currentDate).tz('Asia/Kolkata').format('YYYY_MM_DD_HH_mm') + extension
	return name + fileExtensionWithTime
}

const generateRedisConfigForQueue = () => {
	const parseURL = new URL(process.env.REDIS_HOST)
	return {
		connection: {
			host: parseURL.hostname,
			port: parseURL.port,
		},
	}
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

function validateInput(input, validationData, modelName, skipValidation = false) {
	const errors = []
	for (const field of validationData) {
		if (!skipValidation) {
			if (field.required === true && !input.hasOwnProperty(field.value)) {
				errors.push({
					param: field.value,
					msg: `${field.value} is required but missing in the input data.`,
				})
			}
		}
		const fieldValue = input[field.value] // Get the value of the current field from the input data

		// Check if the field is not allowed for the current model and has a value
		if (modelName && !field.model_names.includes(modelName) && input[field.value]) {
			errors.push({
				param: field.value,
				msg: `${field.value} is not allowed for the ${modelName} model.`,
			})
		}

		function addError(field, value, dataType, message) {
			errors.push({
				param: field.value,
				msg: `${value} is invalid for data type ${dataType}. ${message}`,
			})
		}

		if (fieldValue !== undefined) {
			// Check if the field value is defined in the input data
			const dataType = field.data_type // Get the data type of the field from validation data

			switch (dataType) {
				case 'ARRAY[STRING]':
					if (!Array.isArray(fieldValue)) {
						addError(field.value, fieldValue, dataType, 'Must be an array of strings')
					} else {
						if (fieldValue.length === 0 && !field.allowEmptyArray) {
							addError(field.value, fieldValue, dataType, 'Array cannot be empty')
						}
						const regex = field.regex ? new RegExp(field.regex) : null
						fieldValue.forEach((element) => {
							if (typeof element !== 'string') {
								addError(field.value, element, dataType, 'It should be a string')
							} else if (element === '' && !field.allowEmptyString) {
								addError(field.value, element, dataType, 'Empty strings are not allowed')
							} else if (field.allow_custom_entities) {
								if (regex && !regex.test(element)) {
									addError(
										field.value,
										element,
										dataType,
										`Does not match the required pattern: ${field.regex}`
									)
								} else if (!regex && /[^A-Za-z0-9\s_]/.test(element)) {
									addError(
										field.value,
										element,
										dataType,
										'It should not contain special characters except underscore.'
									)
								}
							}
						})
					}
					break

				case 'STRING':
					if (typeof fieldValue !== 'string') {
						addError(field.value, fieldValue, dataType, 'It should be a string')
					} else if (fieldValue === '' && !field.allowEmptyString) {
						addError(field.value, fieldValue, dataType, 'Empty strings are not allowed')
					} else if (field.allow_custom_entities) {
						const regex = field.regex ? new RegExp(field.regex) : null
						if (regex && !regex.test(fieldValue)) {
							addError(
								field.value,
								fieldValue,
								dataType,
								`Does not match the required pattern: ${field.regex}`
							)
						} else if (!field.regex && /[^A-Za-z0-9\s_]/.test(fieldValue)) {
							addError(
								field.value,
								fieldValue,
								dataType,
								'It should not contain special characters except underscore.'
							)
						}
					}
					break

				case 'NUMBER':
					console.log('Type of', typeof fieldValue)
					if (typeof fieldValue !== 'number') {
						addError(field.value, fieldValue, dataType, '')
					}
					break

				default:
					//isValid = false
					break
			}
		}

		if (
			!fieldValue ||
			field.allow_custom_entities === true ||
			field.has_entities === false ||
			field.external_entity_type === true
		) {
			continue // Skip validation if the field is not present in the input or allow_custom_entities is true
		}

		if (Array.isArray(fieldValue)) {
			// Check if the field value is an array
			for (const value of fieldValue) {
				if (!field.entities.some((entity) => entity.value === value)) {
					// Check if the value is a valid entity
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
				entityMap.set('external_entity_type', entityType.external_entity_type)
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
		if (!doesAffectedFieldsExist) return requestBody
		requestBody.custom_entity_text = {}
		if (!requestBody.meta) requestBody.meta = {}
		for (const currentFieldName in requestBody) {
			const [currentFieldValue, isFieldValueAnArray] = Array.isArray(requestBody[currentFieldName])
				? [[...requestBody[currentFieldName]], true] //If the requestBody[currentFieldName] is array, make a copy in currentFieldValue than a reference
				: [requestBody[currentFieldName], false]
			const entityType = entityTypeMap.get(currentFieldName)
			if (entityType && entityType.get('allow_custom_entities')) {
				if (isFieldValueAnArray) {
					requestBody[currentFieldName] = []
					const recognizedEntities = []
					const customEntities = []
					// this array can hold values for external entity types
					const externalEntities = []
					for (const value of currentFieldValue) {
						if (entityType.get('entities').has(value)) recognizedEntities.push(value)
						else if (entityType.get('external_entity_type')) externalEntities.push(value)
						else customEntities.push({ value: 'other', label: value })
					}
					if (recognizedEntities.length > 0)
						if (allowedKeys.includes(currentFieldName)) requestBody[currentFieldName] = recognizedEntities
						else requestBody.meta[currentFieldName] = recognizedEntities
					if (customEntities.length > 0) {
						requestBody[currentFieldName].push('other') //This should cause error at DB write
						requestBody.custom_entity_text[currentFieldName] = customEntities
					}
					// If external entities are passed store it in meta
					if (externalEntities.length > 0) {
						requestBody.meta[currentFieldName] = externalEntities
					}
				} else {
					if (!entityType.get('entities').has(currentFieldValue)) {
						if (!entityType.get('external_entity_type')) {
							requestBody.custom_entity_text[currentFieldName] = {
								value: 'other',
								label: currentFieldValue,
							}
						}

						if (allowedKeys.includes(currentFieldName)) {
							requestBody[currentFieldName] = 'other' //This should cause error at DB write
						} else {
							// if entity type is external meta should store current field value else 'other'
							entityType.get('external_entity_type')
								? (requestBody.meta[currentFieldName] = currentFieldValue)
								: (requestBody.meta[currentFieldName] = 'other')
						}
					} else if (!allowedKeys.includes(currentFieldName))
						requestBody.meta[currentFieldName] = currentFieldValue
				}
			}
		}
		if (Object.keys(requestBody.meta).length === 0) requestBody.meta = null
		if (Object.keys(requestBody.custom_entity_text).length === 0) requestBody.custom_entity_text = null
		return requestBody
	} catch (error) {
		console.error(error)
	}
}

// Construct a new URL by joining base url and end point
const constructUrl = (externalBaseUrl, endPoint) => {
	// Handle null, undefined, or empty inputs
	if (!externalBaseUrl || !endPoint) {
		return externalBaseUrl || endPoint || ''
	}

	// Remove trailing slashes from base URL and leading slashes from endpoint
	const normalizedBase = externalBaseUrl.replace(/\/+$/, '')
	const normalizedEndPoint = endPoint.replace(/^\/+/, '')

	// Join with a single slash
	return `${normalizedBase}/${normalizedEndPoint}`
}

async function processDbResponse(responseBody, entityType) {
	if (responseBody.meta) {
		let externalFetchPromise = []
		entityType.forEach(async (entity) => {
			const entityTypeValue = entity.value
			if (responseBody?.meta?.hasOwnProperty(entityTypeValue)) {
				// Move the key from responseBody.meta to responseBody root level -> should happen only if entity type is not external
				if (!entity.external_entity_type) {
					// Move the key from responseBody.meta to responseBody root level
					responseBody[entityTypeValue] = responseBody.meta[entityTypeValue]
					// Delete the key from responseBody.meta
					delete responseBody.meta[entityTypeValue]
				} else {
					const externalBaseUrl =
						process.env?.[`${entity.meta.service.toUpperCase()}_BASE_URL`] ||
						process.env?.[`${entity.meta.service.replace(/-/g, '_').toUpperCase()}_BASE_URL`]
					const url = constructUrl(externalBaseUrl, entity.meta.endPoint)
					const projection = ['_id', 'metaInformation.name', 'metaInformation.externalId']
					if (_.isArray(responseBody.meta[entityTypeValue])) {
						for (entity of responseBody.meta[entityTypeValue]) {
							const filterData = {
								_id: entity,
								tenantId: responseBody.tenant_code,
							}

							externalFetchPromise.push(
								axios.post(
									url,
									{
										query: filterData,
										projection: projection,
									},
									{
										headers: {
											'Content-Type': 'application/json',
											'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
										},
									}
								)
							)
						}
					} else {
						const filterData = {
							_id: responseBody.meta[entityTypeValue],
							tenantId: responseBody.tenant_code,
						}
						externalFetchPromise.push(
							axios.post(
								url,
								{
									query: filterData,
									projection: projection,
								},
								{
									headers: {
										'Content-Type': 'application/json',
										'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
									},
								}
							)
						)
					}
				}
			}
		})

		if (externalFetchPromise.length > 0) {
			const externalFetchResponse = await Promise.all(
				externalFetchPromise.map((promise) =>
					promise.catch((err) => {
						console.error('Entity fetch API request failed:', err.message)
						return {} // Return empty object on error
					})
				)
			)

			const parseResponse = externalFetchResponse.map((response, index) => {
				// Check if response is empty object (from failed request)
				if (!response || Object.keys(response).length === 0) {
					console.warn(`Empty or no response at index ${index}`)
					return {}
				}

				// Check if response.data exists
				if (!response.data) {
					console.warn(`No data in response at index ${index}`)
					return {}
				}

				// Check if result array exists and has data
				if (
					!response.data.result ||
					!Array.isArray(response.data.result) ||
					response.data.result.length === 0
				) {
					console.warn(`No result array or empty result at index ${index}`)
					return {}
				}

				return response.data.result[0]
			})
			entityType.forEach(async (entity) => {
				const entityTypeValue = entity.value
				if (responseBody?.meta?.hasOwnProperty(entityTypeValue)) {
					entityType.forEach((entity) => {
						const entityTypeValue = entity.value
						if (responseBody?.meta?.hasOwnProperty(entityTypeValue)) {
							// Move the key from responseBody.meta to responseBody root level -> should happen only if entity type is not external
							if (entity.external_entity_type) {
								if (_.isArray(responseBody.meta[entityTypeValue])) {
									for (entity of responseBody.meta[entityTypeValue]) {
										const findEntity = parseResponse.find((fetched) => fetched._id == entity) || {}
										if (findEntity && Object.keys(findEntity).length > 0) {
											if (
												responseBody[entityTypeValue] &&
												Array.isArray(responseBody[entityTypeValue])
											) {
												// Push to existing array
												responseBody[entityTypeValue].push({
													value: findEntity['_id'],
													label: findEntity.metaInformation.name,
													externalId: findEntity.metaInformation.externalId,
												})
											} else {
												// Create new array with the value
												responseBody[entityTypeValue] = [
													{
														value: findEntity['_id'],
														label: findEntity.metaInformation.name,
														externalId: findEntity.metaInformation.externalId,
													},
												]
											}
										}
									}
								} else {
									const findEntity =
										parseResponse.find(
											(fetched) => fetched._id == responseBody.meta[entityTypeValue]
										) || {}

									if (findEntity && Object.keys(findEntity).length > 0) {
										responseBody[entityTypeValue] = {
											value: findEntity['_id'],
											label: findEntity.metaInformation.name,
											externalId: findEntity.metaInformation.externalId,
										}
									} else {
										responseBody[entityTypeValue] = {}
									}
								}
								delete responseBody.meta[entityTypeValue]
							}
						}
					})
				}
			})
		}
	}

	const output = { ...responseBody } // Create a copy of the responseBody object

	for (const key in output) {
		if (entityType.some((entity) => entity.value === key) && output[key] !== null) {
			const matchingEntity = entityType.find((entity) => entity.value === key)
			const matchingValues = matchingEntity.entities
				.filter((entity) => (Array.isArray(output[key]) ? output[key].includes(entity.value) : true))
				.map((entity) => ({
					value: entity.value,
					label: entity.label,
				}))
			if (matchingValues.length > 0)
				output[key] = Array.isArray(output[key])
					? matchingValues
					: matchingValues.find((entity) => entity.value === output[key])
			else if (Array.isArray(output[key])) output[key] = output[key].filter((item) => item.value && item.label)
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
	return data
}

async function processMetaWithNames(meta, entityType, tenantCode) {
	let responseBody = {}
	let externalFetchPromise = []
	entityType.forEach(async (entity) => {
		const entityTypeValue = entity.value
		meta[entityTypeValue] =
			meta?.hasOwnProperty(entityTypeValue) && entity.data_type == 'ARRAY'
				? meta[entityTypeValue].split(',').map((val) => val.trim())
				: meta[entityTypeValue]

		if (meta?.hasOwnProperty(entityTypeValue)) {
			// Move the key from meta to root level -> should happen only if entity type is not external
			if (!entity.external_entity_type) {
				// Move the key from meta to responseBody root level
				responseBody[entityTypeValue] = meta[entityTypeValue]
			} else {
				const externalBaseUrl =
					process.env?.[`${entity.meta.service.toUpperCase()}_BASE_URL`] ||
					process.env?.[`${entity.meta.service.replace(/-/g, '_').toUpperCase()}_BASE_URL`]
				const url = constructUrl(externalBaseUrl, entity.meta.endPoint)
				const projection = ['_id', 'metaInformation.name']
				if (_.isArray(meta[entityTypeValue])) {
					for (entity of meta[entityTypeValue]) {
						let filterData = {}
						filterData['metaInformation.name'] = entity
						filterData['tenantId'] = tenantCode

						externalFetchPromise.push(
							axios.post(
								url,
								{
									query: filterData,
									projection: projection,
								},
								{
									headers: {
										'Content-Type': 'application/json',
										'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
									},
								}
							)
						)
					}
				} else {
					let filterData = {}
					filterData['metaInformation.name'] = meta[entityTypeValue]
					filterData['tenantId'] = tenantCode

					externalFetchPromise.push(
						axios.post(
							url,
							{
								query: filterData,
								projection: projection,
							},
							{
								headers: {
									'Content-Type': 'application/json',
									'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
								},
							}
						)
					)
				}
			}
		}
	})

	if (externalFetchPromise.length > 0) {
		const externalFetchResponse = await Promise.all(
			externalFetchPromise.map((promise) =>
				promise.catch((err) => {
					console.error('Entity fetch API request failed:', err.message)
					return {} // Return empty object on error
				})
			)
		)

		const parseResponse = externalFetchResponse.map((response, index) => {
			// Check if response is empty object (from failed request)
			if (!response || Object.keys(response).length === 0) {
				console.warn(`Empty or no response at index ${index}`)
				return {}
			}

			// Check if response.data exists
			if (!response.data) {
				console.warn(`No data in response at index ${index}`)
				return {}
			}

			// Check if result array exists and has data
			if (!response.data.result || !Array.isArray(response.data.result) || response.data.result.length === 0) {
				console.warn(`No result array or empty result at index ${index}`)
				return {}
			}

			return response.data.result[0]
		})
		entityType.forEach(async (entity) => {
			const entityTypeValue = entity.value
			if (meta?.hasOwnProperty(entityTypeValue)) {
				entityType.forEach((entity) => {
					const entityTypeValue = entity.value
					if (meta?.hasOwnProperty(entityTypeValue)) {
						// Move the key from responseBody.meta to responseBody root level -> should happen only if entity type is not external
						if (entity.external_entity_type) {
							if (_.isArray(meta[entityTypeValue])) {
								for (entity of meta[entityTypeValue]) {
									const findEntity =
										parseResponse.find((fetched) => fetched.metaInformation.name == entity) || {}
									if (findEntity && Object.keys(findEntity).length > 0) {
										if (
											responseBody[entityTypeValue] &&
											Array.isArray(responseBody[entityTypeValue])
										) {
											// Push to existing array
											if (!responseBody[entityTypeValue].includes(findEntity['_id'])) {
												responseBody[entityTypeValue].push(findEntity['_id'])
											}
										} else {
											// Create new array with the value
											responseBody[entityTypeValue] = [findEntity['_id']]
										}
									}
								}
							} else {
								const findEntity =
									parseResponse.find(
										(fetched) => fetched.metaInformation.name == meta[entityTypeValue]
									) || {}

								if (findEntity && Object.keys(findEntity).length > 0) {
									responseBody[entityTypeValue] = findEntity['_id']
								} else {
									responseBody[entityTypeValue] = ''
								}
							}
						}
					}
				})
			}
		})
	}

	return responseBody
}

async function fetchAndMapAllExternalEntities(entities, service, endPoint, tenantCode) {
	let responseBody = {}
	const externalBaseUrl =
		process.env?.[`${service.toUpperCase()}_BASE_URL`] ||
		process.env?.[`${service.replace(/-/g, '_').toUpperCase()}_BASE_URL`]
	const url = constructUrl(externalBaseUrl, endPoint)
	const projection = ['_id', 'metaInformation.name', 'metaInformation.externalId', 'entityType']
	let data = []

	await axios({
		method: 'post',
		url,
		headers: {
			'content-type': 'application/json',
			'internal-access-token': process.env.INTERNAL_ACCESS_TOKEN,
		},
		data: {
			query: {
				'metaInformation.name': {
					$in: entities, // Dynamically pass the array here
				},
				tenantId: tenantCode,
			},
			projection,
		},
	})
		.then((response) => {
			data = response?.data?.result || []
		})
		.catch((error) => {
			console.error(error)
		})

	responseBody = data.reduce((acc, { _id, entityType, metaInformation }) => {
		const key = metaInformation?.name?.replaceAll(/\s+/g, '').toLowerCase()
		if (key) {
			acc[key] = { _id, entityType, externalId: metaInformation.externalId }
		}
		return acc
	}, {})
	return responseBody
}

function removeParentEntityTypes(data) {
	const parentIds = data.filter((item) => item.parent_id !== null).map((item) => item.parent_id)
	return data.filter((item) => !parentIds.includes(item.id))
}

const removeDefaultOrgEntityTypes = (entityTypes, orgId) => {
	const entityTypeMap = new Map()
	entityTypes.forEach((entityType) => {
		if (!entityTypeMap.has(entityType.value)) entityTypeMap.set(entityType.value, entityType)
		else if (entityType.organization_id === orgId) entityTypeMap.set(entityType.value, entityType)
	})
	return Array.from(entityTypeMap.values())
}

function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

function isValidName(name) {
	const nameRegex = /^[A-Za-z\s'-]+$/
	return nameRegex.test(name)
}
const generateWhereClause = (tableName) => {
	let whereClause = ''

	switch (tableName) {
		case 'users':
			whereClause = `deleted_at IS NULL AND status = 'ACTIVE'`
			break

		default:
			whereClause = 'deleted_at IS NULL'
	}

	return whereClause
}

const getRoleTitlesFromId = (roleIds = [], roleList = []) => {
	return roleIds.map((roleId) => {
		const role = roleList.find((r) => r.id === roleId)
		return role ? role.title : null
	})
}

const convertDurationToSeconds = (duration) => {
	const timeUnits = {
		s: 1,
		m: 60,
		h: 3600,
		d: 86400,
	}

	const match = /^(\d*\.?\d*)([smhd])$/.exec(duration)
	if (!match) {
		throw new Error('Invalid duration format')
	}

	const value = parseFloat(match[1])
	const unit = match[2]

	if (!(unit in timeUnits)) {
		throw new Error('Invalid duration unit')
	}

	return value * timeUnits[unit]
}

function deleteKeysFromObject(obj, keys) {
	keys.forEach((key) => {
		delete obj[key]
	})

	return obj
}

function convertExpiryTimeToSeconds(expiryTime) {
	expiryTime = String(expiryTime)
	const match = expiryTime.match(/^(\d+)([m]?)$/)
	if (match) {
		const value = parseInt(match[1], 10) // Numeric value
		const unit = match[2]
		if (unit === 'm') {
			return Math.floor(value / 60)
		} else {
			return value
		}
	}
}
// Add this to your utils.js file or create it inline
function generateRandomPassword() {
	const length = 10
	const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
	let password = ''
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length)
		password += charset[randomIndex]
	}
	return password
}

function isValidPassword(password) {
	const regex = new RegExp(process.env.PASSWORD_POLICY_REGEX)
	return typeof password === 'string' && password.trim() !== '' && !/\s/.test(password) && regex.test(password)
}

function setRoleLabelsByLanguage(roles, language) {
	roles.map((roles) => {
		if (roles.translations) {
			const roleTranslation = roles.translations[language] || roles.translations['en']
			roles.label = roleTranslation?.title || roles.title
		}
		delete roles.translations
		return roles
	})
}

/**
 * parse domain
 * @method
 * @name parseDomain
 * @param {string} domain - complete Domain / sub-domain
 * @returns {string} - cleaned up domain / sub-domain without any trailing forward slashes and protocols mentioned
 */
function parseDomain(domain) {
	// Ensure the input is a string and not empty
	if (typeof domain !== 'string' || domain.trim() === '') {
		return ''
	}

	// Remove protocol (http://, https://, etc.) using regex
	let cleanedDomain = domain.replace(/^https?:\/\//i, '')

	// Remove trailing slashes
	cleanedDomain = cleanedDomain.replace(/\/+$/, '')

	return cleanedDomain
}

function generateSecureOTP(length = 6) {
	// Generate cryptographically strong random bytes
	const randomBytes = crypto.randomBytes(length)

	// Convert to a number string of specified length
	let otp = ''
	for (let i = 0; i < length; i++) {
		// Use modulo 10 to get a digit (0-9) from each byte
		otp += (randomBytes[i] % 10).toString()
	}

	// Ensure first digit isn't 0 for consistent length
	if (otp[0] === '0') {
		otp = ((parseInt(otp[0]) + 1) % 10).toString() + otp.substring(1)
	}

	return parseInt(otp)
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
	generateRedisConfigForQueue,
	internalSet: internalSet,
	internalDel: internalDel,
	internalGet: internalGet,
	redisSet: redisSet,
	redisGet: redisGet,
	redisDel: redisDel,
	isNumeric: isNumeric,
	extractFilename: extractFilename,
	extractDomainFromEmail: extractDomainFromEmail,
	generateCSVContent: generateCSVContent,
	processDbResponse,
	restructureBody,
	validateInput,
	removeParentEntityTypes,
	removeDefaultOrgEntityTypes,
	isValidEmail,
	isValidName,
	generateWhereClause,
	getRoleTitlesFromId,
	convertDurationToSeconds,
	getPublicDownloadableUrl,
	deleteKeysFromObject,
	convertExpiryTimeToSeconds,
	generateRandomPassword,
	isValidPassword,
	setRoleLabelsByLanguage,
	parseDomain,
	generateSecureOTP,
	constructUrl,
	processMetaWithNames,
	fetchAndMapAllExternalEntities,
}
