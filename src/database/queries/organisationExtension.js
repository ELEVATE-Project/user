'use strict'
const OrganizationExtension = require('@database/models/index').OrganizationExtension
const common = require('@constants/common')

module.exports = class OrganizationExtensionQueries {
	static async upsert(data) {
		try {
			if (!data.organization_id) throw new Error('organization_id Missing')
			const [orgPolicies] = await OrganizationExtension.upsert(data, {
				returning: true,
				where: {
					organization_id: data.organization_id,
				},
			})
			return orgPolicies
		} catch (error) {
			throw new Error(`Error creating/updating organisation extension: ${error.message}`)
		}
	}

	static async getById(orgId) {
		try {
			const orgPolicies = await OrganizationExtension.findOne({
				where: {
					organization_id: orgId,
				},
				raw: true,
			})
			return orgPolicies
		} catch (error) {
			throw new Error(`Error fetching organisation extension: ${error.message}`)
		}
	}

	/**
	 * Find or insert organization extension data based on organizationId.
	 *
	 * @param {string} organizationId - The organization ID to search or insert.
	 * @returns {Promise<>} - The found or inserted organization extension data.
	 * @throws {Error} If organizationId is missing or if an error occurs during the operation.
	 */

	static async findOrInsertOrganizationExtension(organizationId) {
		try {
			if (!organizationId) {
				throw new Error('organization Id Missing')
			}

			const data = common.DEFAULT_ORGANISATION_POLICY
			data.organization_id = organizationId
			// Try to find the data, and if it doesn't exist, create it
			const [orgPolicies, created] = await OrganizationExtension.findOrCreate({
				where: {
					organization_id: organizationId,
				},
				defaults: data,
			})

			return orgPolicies.dataValues
		} catch (error) {
			throw new Error(`Error finding/inserting organisation extension: ${error.message}`)
		}
	}
}
