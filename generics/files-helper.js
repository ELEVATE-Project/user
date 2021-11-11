/**
 * name : generics/files-helper.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : cloud services helpers methods.
*/

const { Storage } = require('@google-cloud/storage');
const S3 = require('aws-sdk/clients/s3');
const path = require('path');
const fs = require('fs');

module.exports = class FilesHelper {

    /**
      * Upload file to GCP 
      * @method
      * @name uploadFileInGcp
      * @param  {filePath} - Stored file path in file system.
      * @param  {destFileName} - fileName to be saved in gc
      * @param  {bucketName} - In which file gets saved
      * @returns {JSON} - Upload result.
    */
    static async uploadFileInGcp(filePath, destFileName, bucketName) {
        const storage = new Storage({
            projectId: process.env.GCP_PROJECT_ID,
            keyFilename: path.join(__dirname, '../', process.env.GCP_PATH)
        });
        bucketName = bucketName || process.env.DEFAULT_GCP_BUCKET_NAME;
        try {
            const uploadedFile = await storage.bucket(bucketName).upload(filePath, {
                destination: destFileName,
                metadata: {}
            });
            return uploadedFile[0].metadata;
        } catch (error) {
            console.log(error);
            error = new Error(error.response.data.error_description);
            error.statusCode = 400;
            throw error;
        }

    }

    /**
      * Upload file to AWS
      * @method
      * @name uploadFileInAws
      * @param  {filePath} - Stored file path in file system.
      * @param  {destFileName} - fileName to be saved in aws
      * @param  {bucketName} - In which file gets saved
      * @returns {JSON} - Upload result.
    */
    static async uploadFileInAws(filePath, destFileName, bucketName) {
        const s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            signatureVersion: 'v4',
            region: process.env.AWS_BUCKET_REGION
        });
        bucketName = bucketName || process.env.DEFAULT_AWS_BUCKET_NAME;

        // Read content from the file as buffer
        const fileContent = fs.readFileSync(filePath);
        
        try {
            const uploadedFile = await s3.upload({
                Bucket: bucketName,
                Key: destFileName,
                Body: fileContent
            }).promise();
            return uploadedFile;
        } catch (error) {
            console.log(error);
            error = new Error(error.response.data.error_description);
            error.statusCode = 400;
            throw error;
        }

    }

    /**
      * Upload file to AZURE
      * @method
      * @name uploadFileInAzure
      * @param  {filePath} - Stored file path in file system.
      * @param  {destFileName} - fileName to be saved in azure
      * @param  {bucketName} - In which file gets saved
      * @returns {JSON} - Upload result.
    */
    static async uploadFileInAzure(filePath, destFileName, bucketName) {
        const storage = new Storage({
            projectId: process.env.GCP_PROJECT_ID,
            keyFilename: path.join(__dirname, '../', process.env.GCP_PATH)
        });
        bucketName = bucketName || process.env.DEFAULT_BUCKET_NAME;
        try {
            const uploadedFile = await storage.bucket(bucketName).upload(filePath, {
                destination: destFileName,
                metadata: {}
            });
            return uploadedFile[0].metadata;
        } catch (error) {
            console.log(error);
            error = new Error(error.response.data.error_description);
            error.statusCode = 400;
            throw error;
        }

    }

}

