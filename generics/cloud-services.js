/**
 * name : generics/files-helper.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : cloud services helpers methods.
 */

const path = require('path');

const {
    AwsFileHelper,
    AzureFileHelper,
    GcpFileHelper
} = require('files-cloud-storage');

module.exports = class FilesHelper {


    static async getGcpSignedUrl(destFilePath, actionType = 'write') {
        const bucketName = process.env.DEFAULT_GCP_BUCKET_NAME;
        const options = {
            destFilePath: destFilePath, // Stored file path - location from bucket - example - users/abc.png
            bucketName: bucketName, // google cloud storage bucket in which action is peformed over file
            actionType: actionType, // signed url usage type - example ('read' | 'write' | 'delete' | 'resumable')
            expiry: Date.now() + 1000 * 60 * 30, // signed url expiration time - In ms from current time - type number | string | Date
            gcpProjectId: process.env.GCP_PROJECT_ID, // google cloud storage project id
            gcpJsonFilePath: path.join(__dirname, '../', process.env.GCP_PATH), // google cloud storage json configuration file absolute path for connectivity
            contentType: 'multipart/form-data', // content type of file, example multipart/form-data, image/png, csv/text etc
        };

        try {
            const signedUrl = await GcpFileHelper.getSignedUrl(options);
            return signedUrl;
        } catch (error) {
            throw error;
        }
    }


    static async getAwsSignedUrl(destFilePath, actionType = 'putObject') {
        const bucketName = process.env.DEFAULT_AWS_BUCKET_NAME;
        const options = {
            destFilePath: destFilePath, // Stored file path - i.e location from bucket - ex - users/abc.png
            bucketName: bucketName, // aws s3 storage bucket in which action is peformed over file
            actionType: actionType, // signed url usage type - example ('putObject' | 'getObject')
            expiry: 30 * 60, // signed url expiration time - In sec - type number
            accessKeyId: process.env.AWS_ACCESS_KEY_ID, // aws s3 access key id
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // aws s3 secret access key
            bucketRegion: process.env.AWS_BUCKET_REGION // aws region where bucket will be located, example - 'ap-south-1'
        }

        try {
            let signedUrl = await AwsFileHelper.getSignedUrl(options);
            return signedUrl;
        } catch (error) {
            throw error;
        }
    }

    static async getAzureSignedUrl(destFilePath) {
        const containerName = process.env.DEFAULT_AZURE_CONTAINER_NAME;

        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 30);

        const options = {
            destFilePath: destFilePath, // Stored file path - i.e location from container - ex - users/abc.png
            containerName: containerName, // container in which file gets saved
            expiry: 30, // signed url expiration time - In minute - type number
            actionType: "w", // signed url usage type - example ('w' | 'r' | 'wr' | 'racwdl') - pair of any alphabets among racwdl
            accountName: process.env.AZURE_ACCOUNT_NAME, // account name of azure storage 
            accountKey: process.env.AZURE_ACCOUNT_KEY, // account key of azure storage 
            contentType: 'multipart/form-data' // content type of file, example multipart/form-data, image/png, csv/text etc
        };


        try {
            const signedUrl = await AzureFileHelper.getSignedUrl(options)
            return signedUrl;
        } catch (error) {
            throw error;
        }
    }

}