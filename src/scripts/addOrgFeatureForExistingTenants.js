'use strict'

require('module-alias/register')
require('dotenv').config({ path: '../.env' })
const environmentData = require('../envVariables')()

if (!environmentData.success) {
	console.error('Server could not start. Not all environment variables are provided.')
	process.exit()
}

const { Tenant, Organization, Feature, OrganizationFeature } = require('../database/models/index') // Adjust path as needed

;(async () => {
	try {
		const tenants = await Tenant.findAll()

		for (const tenant of tenants) {
			const defaultOrg = await Organization.findOne({
				tenant_code: tenant.code,
				code: process.env.DEFAULT_TENANT_ORG_CODE,
			})

			console.log(JSON.stringify(tenants, null, 2))

			if (!defaultOrg) {
				console.warn(`No default organization for tenant ${tenant.code}`)
				continue
			}

			const features = await Feature.findAll()
			console.log(JSON.stringify(features, null, 2))

			for (const feature of features) {
				await OrganizationFeature.create({
					organization_code: defaultOrg.code,
					feature_code: feature.code,
					enabled: true,
					feature_name: feature.label,
					icon: feature.icon,
					tenant_code: tenant.code,
				})
				console.log(`Inserted feature ${feature.code} for org ${defaultOrg.code}`)
			}
		}

		console.log('Completed')
	} catch (error) {
		console.error('Error inserting features:', error)
	}
})()
