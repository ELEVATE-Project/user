// Dependencies
const request = require('request')
require('dotenv').config({ path: '../.env' })
const entityTypeQueries = require('../database/queries/entityType')

// Data
const schedulerServiceUrl = process.env.SCHEDULER_SERVICE_HOST // Port address on which the scheduler service is running
const mentoringBaseurl = `http://localhost:${process.env.APPLICATION_PORT}`
const apiEndpoints = require('../constants/endpoints')
const defaultOrgId = process.env.DEFAULT_ORG_ID

/**
 * Create a scheduler job.
 *
 * @param {string} jobId - The unique identifier for the job.
 * @param {number} interval - The delay in milliseconds before the job is executed.
 * @param {string} jobName - The name of the job.
 * @param {string} modelName - The template for the notification.
 */
const createSchedulerJob = function (jobId, interval, jobName, repeat, url, offset) {
	const bodyData = {
		jobName: jobName,
		email: [process.env.SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID],
		request: {
			url,
			method: 'post',
			header: { internal_access_token: process.env.INTERNAL_ACCESS_TOKEN },
		},
		jobOptions: {
			jobId: jobId,
			repeat: repeat
				? { every: Number(interval), offset }
				: { every: Number(interval), limit: 1, immediately: true }, // Add limit only if repeat is false
			removeOnComplete: 50,
			removeOnFail: 200,
		},
	}

	const options = {
		headers: {
			'Content-Type': 'application/json',
		},
		json: bodyData,
	}

	const apiUrl = schedulerServiceUrl + process.env.SCHEDULER_SERVICE_BASE_URL + apiEndpoints.CREATE_SCHEDULER_JOB

	try {
		request.post(apiUrl, options, (err, data) => {
			if (err) {
				console.error('Error in createSchedulerJob POST request:', err)
			} else {
				if (data.body.success) {
					//console.log('Scheduler', data.body)
					//console.log('Request made to scheduler successfully (createSchedulerJob)')
				} else {
					console.error('Error in createSchedulerJob POST request response:', data.body)
				}
			}
		})
	} catch (error) {
		console.error('Error in createSchedulerJob ', error)
	}
}

const getAllowFilteringEntityTypes = async () => {
	try {
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

/**
 * Trigger periodic view refresh for allowed entity types.
 */
const triggerPeriodicViewRefresh = async () => {
	try {
		const allowFilteringEntityTypes = await getAllowFilteringEntityTypes()
		const modelNames = await modelNameCollector(allowFilteringEntityTypes)

		let offset = process.env.REFRESH_VIEW_INTERVAL / modelNames.length
		modelNames.map((model, index) => {
			createSchedulerJob(
				'repeatable_view_job' + model,
				process.env.REFRESH_VIEW_INTERVAL,
				'repeatable_view_job' + model,
				true,
				mentoringBaseurl + '/mentoring/v1/admin/triggerPeriodicViewRefreshInternal?model_name=' + model,
				offset * index
			)
		})
	} catch (err) {
		console.log(err)
	}
}
const buildMaterializedViews = async () => {
	try {
		createSchedulerJob(
			'BuildMaterializedViews',
			10000,
			'BuildMaterializedViews',
			false,
			mentoringBaseurl + '/mentoring/v1/admin/triggerViewRebuildInternal'
		)
	} catch (err) {
		console.log(err)
	}
}
// Triggering the starting function
buildMaterializedViews()
triggerPeriodicViewRefresh()
