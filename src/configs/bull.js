;('use strict')
const { Worker } = require('bullmq')
const fs = require('fs')
const userInviteHelper = require('@services/helper/userInvite')
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
				if (job.name == 'upload_invites') {
					console.log(`Processing job ${job.id}: ${job.data}`)
					let response = await userInviteHelper.uploadInvites(job.data)
					if (!response.success) {
						logger.info(`Job with id ${job.id} Error ${response.message}`)
					}
				}
			},
			redisConfiguration
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
