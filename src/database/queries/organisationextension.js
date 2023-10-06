'use strict'
const OrganisationExtension = require('@database/models/index').OrganisationExtension

module.exports = class OrganisationExtensionQueries {
	static async create(data) {
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
}
