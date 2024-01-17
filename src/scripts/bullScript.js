// Details : script to add mentor job to scheduler service
/*How to run the script : 
    step 1 : go to scripts directory - cd src/scripts/
    serp 2 : run the script file -  node schedulerScript.js
*/

// Dependencies
const request = require('request')
require('dotenv').config({ path: '../.env' })

//Data
const schedulerServiceUrl = process.env.SCHEDULER_SERVICE_URL // port address on which scheduler service is running
const email = [process.env.SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID] // email id, to which error reports are send during exicution failure of job
const internalAcsessToken = process.env.INTERNAL_ACCESS_TOKEN // internal access token for mentor service
const mentoringBaseurl = `http://localhost:${process.env.APPLICATION_PORT}`

// API ONE
// Request body for emailCronJobBeforeFifteenMin
const emailCronJobBeforeFifteenMinData = {
	jobName: 'emailCronJobBeforeFifteenMin',
	email: email,
	request: {
		url: mentoringBaseurl + '/mentoring/v1/notifications/emailCronJobBeforeFifteenMin',
		method: 'get',
		header: { internal_access_token: internalAcsessToken },
	},
	schedule: '* * * * *',
}
// calling function that make http request
addSchedulerJob(emailCronJobBeforeFifteenMinData)

// API TWO
// Request body for emailCronJobBeforeOneDay
const emailCronJobBeforeOneDayData = {
	jobName: 'emailCronJobBeforeOneDay',
	email: email,
	request: {
		url: mentoringBaseurl + '/mentoring/v1/notifications/emailCronJobBeforeOneDay',
		method: 'get',
		header: { internal_access_token: internalAcsessToken },
	},
	schedule: '* * * * *',
}
// calling function that make http request
addSchedulerJob(emailCronJobBeforeOneDayData)

// API THREE
// Request body for emailCronJobBeforeOneHour
const emailCronJobBeforeOneHourData = {
	jobName: 'emailCronJobBeforeOneHour',
	email: email,
	request: {
		url: mentoringBaseurl + '/mentoring/v1/notifications/emailCronJobBeforeOneHour',
		method: 'get',
		header: { internal_access_token: internalAcsessToken },
	},
	schedule: '* * * * *',
}
// calling function that make http request
addSchedulerJob(emailCronJobBeforeOneHourData)

// call scheduler service using request
async function addSchedulerJob(bodyData) {
	try {
		const options = {
			headers: {
				'content-type': 'application/json',
			},
			json: bodyData,
		}

		request.post(schedulerServiceUrl, options, schedulerCallback)

		function schedulerCallback(err, data) {
			if (err) {
				console.log('Error occured. failed to make request')
			} else {
				console.log('Response : ', data.body)
			}
		}
	} catch (error) {
		console.log('error : ', error)
	}
}
