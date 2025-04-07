;('use strict')
const { Worker } = require('bullmq')
const fs = require('fs')
const userInviteService = require('@services/userInvite')
const userBulkCreateService = require('../helpers/userInvite')
const common = require('@constants/common')
const utils = require('@generics/utils')
const path = require('path')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

const redisConfiguration = utils.generateRedisConfigForQueue()

module.exports = function () {
	try {
		const ProjectRootDir = path.join(__dirname, '..')
		const destPath = ProjectRootDir + common.tempFolderForBulkUpload

		if (!fs.existsSync(destPath)) {
			fs.mkdirSync(destPath)
		}

		const worker = new Worker(
			process.env.DEFAULT_QUEUE,
			async (job) => {
				const startTime = Date.now()

				try {
					logger.info(`Started processing job ${job.name} with ID: ${job.id}`)

					let response

					if (job.name === 'upload_invites') {
						response = await userInviteService.uploadInvites(job.data)
						logger.info(`upload_invites response: ${JSON.stringify(response)}`)
					} else if (job.name === 'bulk_user_create') {
						response = await userBulkCreateService.uploadInvites(job.data)
						logger.info(`bulk_user_create response: ${JSON.stringify(response)}`)
					}

					if (!response?.success) {
						logger.error(`Job ${job.name} (${job.id}) failed: ${response?.message}`)
					}
				} catch (err) {
					logger.error(`Job ${job.name} (${job.id}) threw an error: ${err.message}`)
					throw err
				} finally {
					const endTime = Date.now()
					const duration = ((endTime - startTime) / 1000).toFixed(2)
					logger.info(`Job ${job.name} (${job.id}) completed in ${duration} seconds`)
				}
			},
			{
				...redisConfiguration,
				lockDuration: 200000, // 2 minutes
				lockRenewTime: 15000, // Renew lock every 15 seconds
			}
		)

		worker.concurrency = 5
		if (worker?.id) {
			console.log('Worker initialized with ID:', worker.id)
		}
		worker.on('completed', (job) => {
			logger.info(`Job with id ${job.id} has been completed`)
		})
		worker.on('requestFail', (job, err) => {
			logger.error(`Job with id ${job.id} Failed`)
		})
	} catch (err) {
		console.error(err)
		throw err
	}
}
