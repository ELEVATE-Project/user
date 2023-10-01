/**
 * Name: scheduler.js
 * Author: Vishnu
 * Created Date: 28-Sept-2023
 * Description: Interaction with Elevate-scheduler service.
 */

// Dependencies
const request = require('request');
const apiEndpoints = require('@constants/endpoints');
const schedulerServiceUrl = process.env.SCHEDULER_SERVICE_URL;
const email = [process.env.SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID];
const mentoringBaseurl = `http://localhost:${process.env.APPLICATION_PORT}`;

/**
 * Create a scheduler job.
 *
 * @param {string} jobId - The unique identifier for the job.
 * @param {number} delay - The delay in milliseconds before the job is executed.
 * @param {string} jobName - The name of the job.
 * @param {string} notificationTemplate - The template for the notification.
 * @returns {Promise} A promise that resolves with the result of the job creation.
 */
const createSchedulerJob = function (jobId, delay, jobName, notificationTemplate) {
    return new Promise(async (resolve, reject) => {
        const bodyData = {
            jobName: jobName,
            email: email,
            request: {
                url: mentoringBaseurl + '/mentoring/v1/notifications/emailCronJob',
                method: 'post',
                header: { internal_access_token: process.env.INTERNAL_ACCESS_TOKEN },
            },
            jobOptions: {
                jobId: jobId,
                delay: delay,
                emailTemplate: notificationTemplate,
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 1
            }
        };

        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
            json: bodyData
        };

        const apiUrl = schedulerServiceUrl + apiEndpoints.CREATE_SCHEDULER_JOB;
        try {
            request.post(apiUrl, options, callback);

            function callback(err, data) {
                if (err) {
                    reject({
                        message: 'SCHEDULER_SERVICE_DOWN',
                    });
                } else {
                    if (data.body.success) {
                        resolve(data.body.message)
                    } else {
                        reject({
                            message: 'NOTIFICATION_SCHEDULE_FAILED',
                        });
                    }

                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Update the delay of a scheduled job.
 *
 * @param {object} bodyData - The data containing information about the job.
 * @returns {Promise} A promise that resolves with the result of the job update.
 */
const updateDelayOfScheduledJob = function (bodyData) {
    return new Promise(async (resolve, reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
            json: bodyData
        };

        const apiUrl = schedulerServiceUrl + apiEndpoints.UPDATE_DELAY;
        try {
            request.post(apiUrl, options, callback);

            function callback(err, data) {
                if (err) {
                    reject({
                        message: 'SCHEDULER_SERVICE_DOWN',
                    });
                } else {
                    if (data.body.success) {
                        resolve(data.body.message)
                    } else {
                        reject({
                            message: 'SCHEDULER_SERVICE_DOWN',
                        });
                    }
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Remove a scheduled job.
 *
 * @param {object} bodyData - The data containing information about the job.
 * @returns {Promise} A promise that resolves with the result of the job removal.
 */
const removeScheduledJob = function (bodyData) {
    return new Promise(async (resolve, reject) => {
        const options = {
            headers: {
                'Content-Type': 'application/json'
            },
            json: bodyData
        };

        const apiUrl = schedulerServiceUrl + apiEndpoints.REMOVE_SCHEDULED_JOB;
        try {
            request.post(apiUrl, options, callback);

            function callback(err, data) {
                if (err) {
                    reject({
                        message: 'SCHEDULER_SERVICE_DOWN',
                    });
                } else {
                    if (data.body.success) {
                        resolve(data.body.message)
                    } else {
                        reject({
                            message: 'SCHEDULER_SERVICE_DOWN',
                        });
                    }
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    createSchedulerJob: createSchedulerJob,
    updateDelayOfScheduledJob: updateDelayOfScheduledJob,
    removeScheduledJob: removeScheduledJob
};
