const Queue = require('bull')
const userInviteHelper = require('@services/helper/userInvite')
const common = require('@constants/common')
const fs = require('fs')

const invitesQueue = new Queue('upload_invites', process.env.REDIS_HOST)

const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()

invitesQueue.process(async (job) => {
	const destPath = PROJECT_ROOT_DIRECTORY + common.tempFolderForBulkUpload
	if (!fs.existsSync(destPath)) {
		fs.mkdirSync(destPath)
	}

	let response = await userInviteHelper.uploadInvites(job.data)
	if (!response.success) {
		console.log(`Job with id ${job.id} Failed`)
	}
})

invitesQueue.on('completed', (job) => {
	console.log(`Job with id ${job.id} has been completed`)
	logger.info(`Job with id ${job.id} has been completed`)
})

invitesQueue.on('failed', (job, err) => {
	console.log(`Job with id ${job.id} Failed`)
	logger.error(`Job with id ${job.id} Failed`)
})

module.exports = invitesQueue
