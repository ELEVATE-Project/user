/**
 * Name: user.js
 * Author: Vishnu
 * Created Date: 09-Oct-2023
 * Description: Interaction with Elevate-user service.
 */ 

// Dependencies
const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
const requests = require('@generics/requests')
const endpoints = require('@constants/endpoints')

/**
 * Fetches the default organization details for a given organization code/id.
 * @param {string} organisationCode - The code of the organization.
 * @returns {Promise} A promise that resolves with the organization details or rejects with an error.
 */

const fetchDefaultOrgDetails = function ( organisationCode ) {
    return new Promise(async (resolve, reject) => {
        try {
            // Construct the URL to read organization details
            let orgReadUrl = userBaseUrl + endpoints.ORGANIZATION_READ + '?organisationCode=' + organisationCode
            let internalToken = true
    
            const orgDetails =  await requests.get(orgReadUrl,
                '', // X-auth-token not required for internal call
                internalToken
            )
            return resolve(orgDetails)
        } catch (error) {
            return reject(error)
        }
    })
}

module.exports = {
	fetchDefaultOrgDetails: fetchDefaultOrgDetails
}