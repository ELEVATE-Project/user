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

		function addError(field, value, dataType, message) {
			errors.push({
				param: field.value,
				msg: `${value} is invalid for data type ${dataType}. ${message}`,
			})
		}

		if (fieldValue !== undefined) {
			const dataType = field.data_type

			switch (dataType) {
				case 'ARRAY[STRING]':
					if (Array.isArray(fieldValue)) {
						fieldValue.forEach((element) => {
							if (typeof element !== 'string') {
								addError(field, element, dataType, 'It should be a string')
							} else if (field.allow_custom_entities && /[^A-Za-z0-9\s_]/.test(element)) {
								addError(
									field,
									element,
									dataType,
									'It should not contain special characters except underscore.'
								)
							}
						})
					} else {
						addError(field, field.value, dataType, '')
					}
					break

				case 'STRING':
					if (typeof fieldValue !== 'string') {
						addError(field, fieldValue, dataType, 'It should be a string')
					} else if (field.allow_custom_entities && /[^A-Za-z0-9\s_]/.test(fieldValue)) {
						addError(
							field,
							fieldValue,
							dataType,
							'It should not contain special characters except underscore.'
						)
					}
					break

				case 'NUMBER':
					console.log('Type of', typeof fieldValue)
					if (typeof fieldValue !== 'number') {
						addError(field, fieldValue, dataType, '')
					}
					break

				default:
					//isValid = false
					break
			}
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
					for (const value of currentFieldValue) {
						if (entityType.get('entities').has(value)) recognizedEntities.push(value)
						else customEntities.push({ value: 'other', label: value })
					}
					if (recognizedEntities.length > 0)
						if (allowedKeys.includes(currentFieldName)) requestBody[currentFieldName] = recognizedEntities
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
		}
		if (Object.keys(requestBody.meta).length === 0) requestBody.meta = null
		if (Object.keys(requestBody.custom_entity_text).length === 0) requestBody.custom_entity_text = null
		return requestBody
	} catch (error) {
		console.error(error)
	}
}

function processDbResponse(responseBody, entityType) {
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

const entity = {
	validateInput,
	entityTypeMapGenerator,
	restructureBody,
	processDbResponse,
	removeParentEntityTypes,
	removeDefaultOrgEntityTypes,
}

module.exports = entity
