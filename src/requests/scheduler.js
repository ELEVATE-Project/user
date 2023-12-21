/**
 * Name: scheduler.js
 * Author: Vishnu
 * Created Date: 28-Sept-2023
 * Description: Interaction with Elevate-scheduler service.
 */

// Dependencies
const request = require('request')
const apiEndpoints = require('@constants/endpoints')
const schedulerServiceUrl = process.env.SCHEDULER_SERVICE_HOST + process.env.SCHEDULER_SERVICE_BASE_URL
const email = [process.env.SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID]
const mentoringBaseurl = `http://localhost:${process.env.APPLICATION_PORT}`

/**
 * Create a scheduler job.
 *
 * @param {string} jobId 					- The unique identifier for the job.
 * @param {number} delay 					- The delay in milliseconds before the job is executed.
 * @param {string} jobName 					- The name of the job.
 * @param {Object} requestBody 				- Job api call request body.
 * @param {function} callback 				- The callback function to handle the result of the job creation.
 */
const createSchedulerJob = function (jobId, delay, jobName, requestBody = {}, urlEndpoint, method) {
	const bodyData = {
		jobName: jobName,
		email: email,
		request: {
			url: mentoringBaseurl + urlEndpoint,
			method,
			header: { internal_access_token: process.env.INTERNAL_ACCESS_TOKEN },
			reqBody: requestBody,
		},

		jobOptions: {
			jobId: jobId,
			delay: delay,
			removeOnComplete: true,
			removeOnFail: false,
			attempts: 1,
		},
	}

	const options = {
		headers: {
			'Content-Type': 'application/json',
		},
		json: bodyData,
	}

	const apiUrl = schedulerServiceUrl + apiEndpoints.CREATE_SCHEDULER_JOB
	try {
		console.log(apiUrl, 'options', options)
		request.post(apiUrl, options, (err, data) => {
			if (err) {
				console.error('Error in createSchedulerJob POST request:', err)
			} else {
				if (data.body.success) {
					console.log('Request made to scheduler successfully (createSchedulerJob)')
				} else {
					console.error('Error in createSchedulerJob POST request response:', data.body)
				}
			}
		})
	} catch (error) {
		console.error('Error in createSchedulerJob ', error)
	}
}

/**
 * Update the delay of a scheduled job.
 *
 * @param {object} bodyData - The data containing information about the job.
 * @param {function} callback - The callback function to handle the result of the job update.
 */
const updateDelayOfScheduledJob = function (bodyData) {
	const options = {
		headers: {
			'Content-Type': 'application/json',
		},
		json: bodyData,
	}

	const apiUrl = schedulerServiceUrl + apiEndpoints.UPDATE_DELAY
	try {
		request.post(apiUrl, options, (err, data) => {
			if (err) {
				console.error('Error in updateDelayOfScheduledJob POST request:', err)
			} else {
				if (data.body.success) {
					console.log('Request made to scheduler successfully (updateDelayOfScheduledJob)')
				} else {
					console.error('Error in updateDelayOfScheduledJob POST request response:', data.body)
				}
			}
		})
	} catch (error) {
		console.error('Error in updateDelayOfScheduledJob ', error)
	}
}

/**
 * Remove a scheduled job.
 *
 * @param {object} bodyData - The data containing information about the job.
 * @param {function} callback - The callback function to handle the result of the job removal.
 */

const removeScheduledJob = function (bodyData) {
	const options = {
		headers: {
			'Content-Type': 'application/json',
		},
		json: bodyData,
	}

	const apiUrl = schedulerServiceUrl + apiEndpoints.REMOVE_SCHEDULED_JOB
	try {
		request.post(apiUrl, options, (err, data) => {
			if (err) {
				console.error('Error in removeScheduledJob POST request:', err)
			} else {
				if (data.body.success) {
					console.log('Request made to scheduler successfully (removeScheduledJob)')
				} else {
					console.error('Error in updateDelayOfScheduledJob POST request response:', data.body)
				}
			}
		})
	} catch (error) {
		console.error('Error in removeScheduledJob ', error)
	}
}

module.exports = {
	createSchedulerJob,
	updateDelayOfScheduledJob,
	removeScheduledJob,
}
