const { AwsFileHelper, GcpFileHelper, AzureFileHelper, OciFileHelper } = require('elevate-cloud-storage')
const path = require('path')

const getDownloadableUrl = async (imgPath) => {
	if (process.env.CLOUD_STORAGE === 'GCP') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_GCP_BUCKET_NAME,
			gcpProjectId: process.env.GCP_PROJECT_ID,
			gcpJsonFilePath: path.join(__dirname, '../', process.env.GCP_PATH),
		}
		imgPath = await GcpFileHelper.getDownloadableUrl(options)
	} else if (process.env.CLOUD_STORAGE === 'AWS') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_AWS_BUCKET_NAME,
			bucketRegion: process.env.AWS_BUCKET_REGION,
		}
		imgPath = await AwsFileHelper.getDownloadableUrl(options.destFilePath, options.bucketName, options.bucketRegion)
	} else if (process.env.CLOUD_STORAGE === 'AZURE') {
		const options = {
			destFilePath: imgPath,
			containerName: process.env.DEFAULT_AZURE_CONTAINER_NAME,
			expiry: 30,
			actionType: 'rw',
			accountName: process.env.AZURE_ACCOUNT_NAME,
			accountKey: process.env.AZURE_ACCOUNT_KEY,
		}
		imgPath = await AzureFileHelper.getDownloadableUrl(options)
	} else if (process.env.CLOUD_STORAGE === 'OCI') {
		const options = {
			destFilePath: imgPath,
			bucketName: process.env.DEFAULT_OCI_BUCKET_NAME,
			endpoint: process.env.OCI_BUCKET_ENDPOINT,
		}
		imgPath = await OciFileHelper.getDownloadableUrl(options)
	}
	return imgPath
}

const cloud = { getDownloadableUrl }

module.exports = cloud
