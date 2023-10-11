const fs = require('fs')
const Queue = require('bull')
const userInviteHelper = require('@services/helper/userInvite')
const common = require('@constants/common')

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

const invitesQueue = new Queue('upload_invites', process.env.REDIS_HOST)

invitesQueue.process(async (job) => {
	console.log(`Job with id ${job.id} Started`)

	const destPath = PROJECT_ROOT_DIRECTORY + common.tempFolderForBulkUpload
	if (!fs.existsSync(destPath)) {
		fs.mkdirSync(destPath)
	}

	let response = await userInviteHelper.uploadInvites(job.data)
	if (!response.success) {
		logger.info(`Job with id ${job.id} Error ${response.message}`)
	}
})

invitesQueue.on('completed', (job) => {
	logger.info(`Job with id ${job.id} has been completed`)
})

invitesQueue.on('failed', (job, err) => {
	logger.error(`Job with id ${job.id} Failed`)
})

module.exports = invitesQueue
