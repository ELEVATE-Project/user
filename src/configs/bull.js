;('use strict')
const { Worker, Queue } = require('bullmq')
const fs = require('fs')
const userInviteService = require('@services/userInvite')
const common = require('@constants/common')
const utils = require('@generics/utils')
const path = require('path')
const { log } = require('console')
const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

const redisConfiguration = utils.generateRedisConfigForQueue()
const logInterval = 30000
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
					let response = await userInviteService.uploadInvites(job.data)
					console.log(response, 'response from invitee upload--------')
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

		const queue = new Queue(process.env.DEFAULT_QUEUE, { connection: redisConfiguration })

		// Function to log job counts
		const logJobCounts = async () => {
			try {
				const waitingCount = await queue.getWaitingCount()
				const delayedCount = await queue.getDelayedCount()
				const failedCount = await queue.getFailedCount()

				console.log(`Waiting jobs count: ${waitingCount}`)
				console.log(`Delayed jobs count: ${delayedCount}`)
				console.log(`Failed jobs count: ${failedCount}`)
			} catch (err) {
				console.log(`Error fetching job counts: ${err.message}`)
			}
		}
		logJobCounts()

		setInterval(logJobCounts, logInterval)
	} catch (err) {
		console.error(err)
		throw err
	}
}
