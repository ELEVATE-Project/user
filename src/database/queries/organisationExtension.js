'use strict'
const OrganisationExtension = require('@database/models/index').OrganisationExtension
const common = require('@constants/common')

module.exports = class OrganisationExtensionQueries {
	static async upsert(data) {
		try {
			if (!data.org_id) throw new Error('Org_id Missing')
			const [orgPolicies] = await OrganisationExtension.upsert(data, {
				returning: true,
				where: {
					org_id: data.org_id,
				},
			})
			return orgPolicies
		} catch (error) {
			throw new Error(`Error creating/updating organisation extension: ${error.message}`)
		}
	}

	static async getById(orgId) {
		try {
			const orgPolicies = await OrganisationExtension.findOne({
				where: {
					org_id: orgId,
				},
			})
			return orgPolicies
		} catch (error) {
			throw new Error(`Error fetching organisation extension: ${error.message}`)
		}
	}

	/**
	 * Find or insert organization extension data based on org_id.
	 *
	 * @param {string} org_id - The organization ID to search or insert.
	 * @returns {Promise<>} - The found or inserted organization extension data.
	 * @throws {Error} If org_id is missing or if an error occurs during the operation.
	 */

	static async findOrInsertOrganizationExtension(org_id) {
		try {
			if (!org_id) {
				throw new Error('Org_id Missing')
			}

			const data = common.DEFAULT_ORGANISATION_POLICY
			data.org_id = org_id
			// Try to find the data, and if it doesn't exist, create it
			const [orgPolicies, created] = await OrganisationExtension.findOrCreate({
				where: {
					org_id: org_id,
				},
				defaults: data,
			})

			return orgPolicies.dataValues
		} catch (error) {
			throw new Error(`Error finding/inserting organisation extension: ${error.message}`)
		}
	}
}
