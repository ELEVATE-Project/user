'use strict'
const entityTypeQueries = require('@database/queries/entityType')
const { sequelize } = require('@database/models/index')
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const modelPath = require('../.sequelizerc')
const utils = require('@generics/utils')
/* async function createSequelizeModelFromMaterializedView(materializedViewName, modelName) {
	try {
		const model = require('@database/models/index')[modelName]
		const primaryKeys = model.primaryKeyAttributes

		const [results, metadata] = await sequelize.query(
			`SELECT attname AS column_name, atttypid::regtype AS data_type FROM pg_attribute WHERE attrelid = 'public.${materializedViewName}'::regclass AND attnum > 0;`
		)

		if (results.length === 0) {
			throw new Error(`Materialized view '${materializedViewName}' not found.`)
		}

		const mapDataTypes = (data_type) => {
			const dataTypeMappings = {
				integer: 'DataTypes.INTEGER',
				'character varying': 'DataTypes.STRING',
				'character varying[]': 'DataTypes.ARRAY(DataTypes.STRING)',
				boolean: 'DataTypes.BOOLEAN',
				'timestamp with time zone': 'DataTypes.DATE',
				jsonb: 'DataTypes.JSONB',
				json: 'DataTypes.JSON',
			}

			return dataTypeMappings[data_type] || 'DataTypes.STRING'
		}

		const attributes = results.map((row) => {
			if (primaryKeys.includes(row.column_name)) {
				return `${row.column_name}: {
					type: ${mapDataTypes(row.data_type)},
					primaryKey: true,
				  },`
			}
			return `${row.column_name}: {
		  type: ${mapDataTypes(row.data_type)},
		},`
		})

		const modelFileContent = `'use strict';
  module.exports = (sequelize, DataTypes) => {
	const ${materializedViewName} = sequelize.define(
	  '${materializedViewName}',
	  {
		${attributes.join('\n      ')}
	  },
	  {
		sequelize,
		modelName: '${materializedViewName}',
		tableName: '${materializedViewName}',
		freezeTableName: true,
		paranoid: true,
	  }
	);
	return ${materializedViewName};
  };`

		const outputFileName = path.join(modelPath['models-path'], `${materializedViewName}.js`)
		fs.writeFileSync(outputFileName, modelFileContent, 'utf-8')

		return modelFileContent
	} catch (error) {
		console.error('Error:', error)
		throw error
	}
} */
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
		console.log(rawAttributes)
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
		const temporaryMaterializedViewName = `m_${tableName}_${generateRandomCode(8)}`
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
		await Promise.all(
			modelEntityTypes.entityTypeValueList.map(async (attribute) => {
				return await sequelize.query(
					`CREATE INDEX m_idx_${model.tableName}_${attribute} ON m_${model.tableName} (${attribute});`
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
		let randomViewName = `m_${tableName}_${generateRandomCode(8)}`
		//const checkOriginalViewQuery = `SELECT EXISTS (SELECT 1 FROM pg_materialized_views WHERE viewname = 'm_${tableName}');`;
		const checkOriginalViewQuery = `SELECT COUNT(*) from pg_matviews where matviewname = 'm_${tableName}';`
		const renameOriginalViewQuery = `ALTER MATERIALIZED VIEW m_${tableName} RENAME TO ${randomViewName};`
		const renameNewViewQuery = `ALTER MATERIALIZED VIEW ${temporaryMaterializedViewName} RENAME TO m_${tableName};`

		const temp = await sequelize.query(checkOriginalViewQuery)
		console.log('VIEW EXISTS: ', temp[0][0].count)
		if (temp[0][0].count > 0) await sequelize.query(renameOriginalViewQuery, { transaction: t })
		else randomViewName = null
		await sequelize.query(renameNewViewQuery, { transaction: t })
		await t.commit()
		console.log('Transaction committed successfully')
		return randomViewName
	} catch (error) {
		await t.rollback()
		console.error('Error executing transaction:', error)
	}
}

const createViewUniqueIndexOnPK = async (model) => {
	try {
		const primaryKeys = model.primaryKeyAttributes
		/* CREATE UNIQUE INDEX unique_index_name
ON my_materialized_view (column1, column2); */
		const result = await sequelize.query(`
            CREATE UNIQUE INDEX m_unique_index_${model.tableName}_${primaryKeys.map((key) => `_${key}`)} 
            ON m_${model.tableName} (${primaryKeys.map((key) => `${key}`).join(', ')});`)
		console.log('UNIQUE RESULT: ', result)
	} catch (err) {
		console.log(err)
	}
}

const generateMaterializedView = async (modelEntityTypes) => {
	try {
		//console.log('MODEL ENTITY TYPES:', modelEntityTypes);
		const model = require('@database/models/index')[modelEntityTypes.modelName]
		console.log('MODEL: ', modelEntityTypes.modelName)
		const { concreteAttributes, metaAttributes } = await filterConcreteAndMetaAttributes(
			Object.keys(model.rawAttributes),
			modelEntityTypes.entityTypeValueList
		)
		//console.log('GENERATE MATERIALIZED VIEW: ', concreteAttributes, metaAttributes);

		const concreteFields = await rawAttributesTypeModifier(model.rawAttributes)
		console.log(concreteFields, '-=-=-=---------')
		const metaFields = await modelEntityTypes.entityTypes
			.map((entity) => {
				if (metaAttributes.includes(entity.value)) return entity
				else null
			})
			.filter(Boolean)
		console.log('MODIFIED TYPES: ', concreteFields)
		console.log('META FIELDS: ', metaFields)
		//if (metaFields.length == 0) return

		const { materializedViewGenerationQuery, temporaryMaterializedViewName } = await materializedViewQueryBuilder(
			model,
			concreteFields,
			metaFields
		)
		console.log('QUERY:', materializedViewGenerationQuery)

		await sequelize.query(materializedViewGenerationQuery)
		console.log('GENERATED:')
		const randomViewName = await renameMaterializedView(temporaryMaterializedViewName, model.tableName)
		if (randomViewName) await deleteMaterializedView(randomViewName)
		await createIndexesOnAllowFilteringFields(model, modelEntityTypes)
		await createViewUniqueIndexOnPK(model)
		/* 		createSequelizeModelFromMaterializedView(`m_${model.tableName}`, modelEntityTypes.modelName)
			.then((modelRes) => {
				console.log(`Sequelize model created for '${model.tableName}' and written to '${model.tableName}.js'.`)
			})
			.catch((error) => {
				console.error('Error:', error)
			}) */
	} catch (err) {
		console.log(err)
	}
}

const getAllowFilteringEntityTypes = async () => {
	try {
		return await entityTypeQueries.findAllEntityTypes(
			1,
			['id', 'value', 'label', 'data_type', 'org_id', 'has_entities', 'model_names'],
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

		const createFunctionSQL = `
		CREATE OR REPLACE FUNCTION transform_jsonb_to_text_array(input_jsonb jsonb) RETURNS text[] AS $$
		DECLARE
			result text[];
			element text;
		BEGIN
			IF jsonb_typeof(input_jsonb) = 'object' THEN
				-- Input is an object, initialize the result array
				result := ARRAY[]::text[];
				-- Loop through the object and add keys to the result array
				FOR element IN SELECT jsonb_object_keys(input_jsonb)
				LOOP
					result := array_append(result, element);
				END LOOP;
			ELSIF jsonb_typeof(input_jsonb) = 'array' THEN
				-- Input is an array, initialize the result array
				result := ARRAY[]::text[];
				-- Loop through the array and add elements to the result array
				FOR element IN SELECT jsonb_array_elements_text(input_jsonb)
				LOOP
					result := array_append(result, element);
				END LOOP;
			ELSE
				-- If input is neither an object nor an array, return an empty array
				result := ARRAY[]::text[];
			END IF;
			RETURN result;
		END;
		$$ LANGUAGE plpgsql;
	  `

		// Execute the SQL statement to create the function
		sequelize
			.query(createFunctionSQL)
			.then(() => {
				console.log('Function created successfully')
			})
			.catch((error) => {
				console.error('Error creating function:', error)
			})

		await Promise.all(
			entityTypesGroupedByModel.map(async (modelEntityTypes) => {
				return generateMaterializedView(modelEntityTypes)
			})
		)
		/* 		const materializedViewName = 'm_sessions' // Replace with the actual materialized view name

		createSequelizeModelFromMaterializedView(materializedViewName, 'Session')
			.then((model) => {
				console.log(
					`Sequelize model created for '${materializedViewName}' and written to '${materializedViewName}.js'.`
				)
			})
			.catch((error) => {
				console.error('Error:', error)
			}) */

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
				console.log(model_names)
				if (model_names && Array.isArray(model_names))
					await Promise.all(
						model_names.map((model) => {
							if (!modelSet.has(model)) modelSet.add(model)
						})
					)
			})
		)
		console.log(modelSet)
		return [...modelSet.values()]
	} catch (err) {
		console.log(err)
	}
}

const refreshMaterializedView = async (modelName) => {
	try {
		const model = require('@database/models/index')[modelName]
		const [result, metadata] = await sequelize.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY m_${model.tableName}`)
		console.log(result, metadata)
	} catch (err) {
		console.log(err)
	}
}

const refreshNextView = (currentIndex, modelNames) => {
	try {
		if (currentIndex < modelNames.length) {
			refreshMaterializedView(modelNames[currentIndex])
			currentIndex++
		} else currentIndex = 0
		return currentIndex
	} catch (err) {
		console.log(err)
	}
}

const triggerPeriodicViewRefresh = async () => {
	try {
		const allowFilteringEntityTypes = await getAllowFilteringEntityTypes()
		const modelNames = await modelNameCollector(allowFilteringEntityTypes)
		console.log('MODEL NAME: ', modelNames)
		const interval = 1 * 60 * 1000 // 1 minute * 60 seconds per minute * 1000 milliseconds per second
		let currentIndex = 0
		setInterval(() => {
			currentIndex = refreshNextView(currentIndex, modelNames)
		}, interval / modelNames.length)
		currentIndex = refreshNextView(currentIndex, modelNames)
	} catch (err) {
		console.log(err)
	}
}

const adminService = {
	triggerViewBuild,
	triggerPeriodicViewRefresh,
}

module.exports = adminService
