'use strict'
const entityTypeQueries = require('@database/queries/entityType')
const { sequelize } = require('@database/models/index')
const utils = require('@generics/utils')
const common = require('@constants/common')
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')

let refreshInterval
const groupByModelNames = async (entityTypes) => {
	const groupedData = new Map()
	entityTypes.forEach((item) => {
		item.model_names.forEach((modelName) => {
			if (groupedData.has(modelName)) {
				groupedData.get(modelName).entityTypes.push(item)
				groupedData.get(modelName).entityTypeValueList.push(item.value)
			} else
				groupedData.set(modelName, {
					modelName: modelName,
					entityTypes: [item],
					entityTypeValueList: [item.value],
				})
		})
	})

	return [...groupedData.values()]
}

const filterConcreteAndMetaAttributes = async (modelAttributes, attributesList) => {
	try {
		const concreteAttributes = []
		const metaAttributes = []
		attributesList.forEach((attribute) => {
			if (modelAttributes.includes(attribute)) concreteAttributes.push(attribute)
			else metaAttributes.push(attribute)
		})
		return { concreteAttributes, metaAttributes }
	} catch (err) {
		console.log(err)
	}
}

const rawAttributesTypeModifier = async (rawAttributes) => {
	try {
		const outputArray = []
		for (const key in rawAttributes) {
			const columnInfo = rawAttributes[key]
			const type = columnInfo.type.key
			const subField = columnInfo.type.options?.type?.key
			const typeMap = {
				ARRAY: {
					JSON: 'json[]',
					STRING: 'character varying[]',
					INTEGER: 'integer[]',
				},
				INTEGER: 'integer',
				DATE: 'timestamp with time zone',
				BOOLEAN: 'boolean',
				JSONB: 'jsonb',
				JSON: 'json',
				STRING: 'character varying',
				BIGINT: 'bigint',
			}
			const conversion = typeMap[type]
			if (conversion) {
				if (type === 'DATE' && (key === 'createdAt' || key === 'updatedAt')) {
					continue
				}
				outputArray.push({
					key: key,
					type: subField ? typeMap[type][subField] : conversion,
				})
			}
		}
		return outputArray
	} catch (err) {
		console.log(err)
	}
}
const metaAttributesTypeModifier = (data) => {
	try {
		const typeMap = {
			'ARRAY[STRING]': 'character varying[]',
			'ARRAY[INTEGER]': 'integer[]',
			'ARRAY[TEXT]': 'text[]',
			INTEGER: 'integer',
			DATE: 'timestamp with time zone',
			BOOLEAN: 'boolean',
			JSONB: 'jsonb',
			JSON: 'json',
			STRING: 'character varying',
			BIGINT: 'bigint',
		}

		const outputArray = data.map((field) => {
			const { data_type, model_names, ...rest } = field
			const convertedDataType = typeMap[data_type]

			return convertedDataType
				? {
						...rest,
						data_type: convertedDataType,
						model_names: Array.isArray(model_names)
							? model_names.map((modelName) => `'${modelName}'`).join(', ')
							: model_names,
				  }
				: field
		})

		return outputArray
	} catch (err) {
		console.error(err)
	}
}

const generateRandomCode = (length) => {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length)
		result += charset[randomIndex]
	}
	return result
}

const materializedViewQueryBuilder = async (model, concreteFields, metaFields) => {
	try {
		const tableName = model.tableName
		const temporaryMaterializedViewName = `${common.materializedViewsPrefix}${tableName}_${generateRandomCode(8)}`
		const concreteFieldsQuery = await concreteFields
			.map((data) => {
				return `${data.key}::${data.type} as ${data.key}`
			})
			.join(',\n')
		const metaFieldsQuery =
			metaFields.length > 0
				? await metaFields
						.map((data) => {
							if (data.data_type == 'character varying[]') {
								return `transform_jsonb_to_text_array(meta->'${data.value}')::${data.data_type} as ${data.value}`
							} else {
								return `(meta->>'${data.value}') as ${data.value}`
							}
						})
						.join(',\n')
				: '' // Empty string if there are no meta fields

		const whereClause = utils.generateWhereClause(tableName)

		const materializedViewGenerationQuery = `CREATE MATERIALIZED VIEW ${temporaryMaterializedViewName} AS
		  SELECT 
			  ${concreteFieldsQuery}${metaFieldsQuery && `,`}${metaFieldsQuery}
		  FROM public."${tableName}"
		  WHERE ${whereClause};`

		return { materializedViewGenerationQuery, temporaryMaterializedViewName }
	} catch (err) {
		console.log(err)
	}
}

const createIndexesOnAllowFilteringFields = async (model, modelEntityTypes) => {
	try {
		const uniqueEntityTypeValueList = [...new Set(modelEntityTypes.entityTypeValueList)]

		await Promise.all(
			uniqueEntityTypeValueList.map(async (attribute) => {
				return await sequelize.query(
					`CREATE INDEX ${common.materializedViewsPrefix}idx_${model.tableName}_${attribute} ON ${common.materializedViewsPrefix}${model.tableName} (${attribute});`
				)
			})
		)
	} catch (err) {
		console.log(err)
	}
}

const deleteMaterializedView = async (viewName) => {
	try {
		await sequelize.query(`DROP MATERIALIZED VIEW ${viewName};`)
	} catch (err) {
		console.log(err)
	}
}

const renameMaterializedView = async (temporaryMaterializedViewName, tableName) => {
	const t = await sequelize.transaction()
	try {
		let randomViewName = `${common.materializedViewsPrefix}${tableName}_${generateRandomCode(8)}`

		const checkOriginalViewQuery = `SELECT COUNT(*) from pg_matviews where matviewname = '${common.materializedViewsPrefix}${tableName}';`
		const renameOriginalViewQuery = `ALTER MATERIALIZED VIEW ${common.materializedViewsPrefix}${tableName} RENAME TO ${randomViewName};`
		const renameNewViewQuery = `ALTER MATERIALIZED VIEW ${temporaryMaterializedViewName} RENAME TO ${common.materializedViewsPrefix}${tableName};`

		const temp = await sequelize.query(checkOriginalViewQuery)

		if (temp[0][0].count > 0) await sequelize.query(renameOriginalViewQuery, { transaction: t })
		else randomViewName = null
		await sequelize.query(renameNewViewQuery, { transaction: t })
		await t.commit()

		return randomViewName
	} catch (error) {
		await t.rollback()
		console.error('Error executing transaction:', error)
	}
}

const createViewUniqueIndexOnPK = async (model) => {
	try {
		const primaryKeys = model.primaryKeyAttributes

		const result = await sequelize.query(`
            CREATE UNIQUE INDEX ${common.materializedViewsPrefix}unique_index_${model.tableName}_${primaryKeys.map(
			(key) => `_${key}`
		)} 
            ON ${common.materializedViewsPrefix}${model.tableName} (${primaryKeys.map((key) => `${key}`).join(', ')});`)
	} catch (err) {
		console.log(err)
	}
}

const generateMaterializedView = async (modelEntityTypes) => {
	try {
		const model = require('@database/models/index')[modelEntityTypes.modelName]

		const { concreteAttributes, metaAttributes } = await filterConcreteAndMetaAttributes(
			Object.keys(model.rawAttributes),
			modelEntityTypes.entityTypeValueList
		)

		const concreteFields = await rawAttributesTypeModifier(model.rawAttributes)

		const metaFields = await modelEntityTypes.entityTypes
			.map((entity) => {
				if (metaAttributes.includes(entity.value)) return entity
				else null
			})
			.filter(Boolean)

		const modifiedMetaFields = await metaAttributesTypeModifier(metaFields)

		const { materializedViewGenerationQuery, temporaryMaterializedViewName } = await materializedViewQueryBuilder(
			model,
			concreteFields,
			modifiedMetaFields
		)

		await sequelize.query(materializedViewGenerationQuery)

		const randomViewName = await renameMaterializedView(temporaryMaterializedViewName, model.tableName)
		if (randomViewName) await deleteMaterializedView(randomViewName)
		await createIndexesOnAllowFilteringFields(model, modelEntityTypes)
		await createViewUniqueIndexOnPK(model)
	} catch (err) {
		console.log(err)
	}
}

const getAllowFilteringEntityTypes = async () => {
	try {
		const defaultOrgId = await getDefaultOrgId()

		return await entityTypeQueries.findAllEntityTypes(
			defaultOrgId,
			['id', 'value', 'label', 'data_type', 'organization_id', 'has_entities', 'model_names'],
			{
				allow_filtering: true,
			}
		)
	} catch (err) {
		console.log(err)
	}
}

const triggerViewBuild = async () => {
	try {
		const allowFilteringEntityTypes = await getAllowFilteringEntityTypes()
		const entityTypesGroupedByModel = await groupByModelNames(allowFilteringEntityTypes)

		await Promise.all(
			entityTypesGroupedByModel.map(async (modelEntityTypes) => {
				return generateMaterializedView(modelEntityTypes)
			})
		)

		return entityTypesGroupedByModel
	} catch (err) {
		console.log(err)
	}
}

//Refresh Flow

const modelNameCollector = async (entityTypes) => {
	try {
		const modelSet = new Set()
		await Promise.all(
			entityTypes.map(async ({ model_names }) => {
				if (model_names && Array.isArray(model_names))
					await Promise.all(
						model_names.map((model) => {
							if (!modelSet.has(model)) modelSet.add(model)
						})
					)
			})
		)
		return [...modelSet.values()]
	} catch (err) {
		console.log(err)
	}
}

const refreshMaterializedView = async (modelName) => {
	try {
		const model = require('@database/models/index')[modelName]
		const [result, metadata] = await sequelize.query(
			`REFRESH MATERIALIZED VIEW CONCURRENTLY ${common.materializedViewsPrefix}${model.tableName}`
		)
		return metadata
	} catch (err) {
		console.log(err)
	}
}

const refreshNextView = (currentIndex, modelNames) => {
	try {
		if (currentIndex < modelNames.length) {
			refreshMaterializedView(modelNames[currentIndex])
			currentIndex++
		} else {
			console.info('All views refreshed. Stopping further refreshes.')
			clearInterval(refreshInterval) // Stop the setInterval loop
		}
		return currentIndex
	} catch (err) {
		console.log(err)
	}
}

const triggerPeriodicViewRefresh = async () => {
	try {
		const allowFilteringEntityTypes = await getAllowFilteringEntityTypes()
		const modelNames = await modelNameCollector(allowFilteringEntityTypes)
		const interval = process.env.REFRESH_VIEW_INTERVAL
		let currentIndex = 0

		// Using the mockSetInterval function to simulate setInterval
		refreshInterval = setInterval(() => {
			currentIndex = refreshNextView(currentIndex, modelNames)
		}, interval / modelNames.length)

		// Immediately trigger the first refresh
		currentIndex = refreshNextView(currentIndex, modelNames)
	} catch (err) {
		console.log(err)
	}
}

const adminService = {
	triggerViewBuild,
	triggerPeriodicViewRefresh,
	refreshMaterializedView,
}

module.exports = adminService
