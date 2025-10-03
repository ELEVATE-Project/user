'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const organizationsFeatures = await queryInterface.sequelize.query(
			'SELECT feature_code, tenant_code, organization_code FROM organization_features WHERE deleted_at IS NULL',
			{ type: Sequelize.QueryTypes.SELECT }
		)

		const allFeatures = await queryInterface.sequelize.query('SELECT code FROM features', {
			type: Sequelize.QueryTypes.SELECT,
		})

		const roleMappings = {
			content_creator: ['scp'],
			reviewer: ['scp', 'learn'],
			creator: ['learn'],
			rollout_manager: ['scp'],
			program_manager: ['scp'],
			program_designer: ['scp'],
			learner: ['learn'],
			mentee: ['project', 'mentoring', 'survey', 'observation', 'reports', 'mitra', 'programs'],
			mentor: ['mentoring'],
			session_manager: ['mentoring'],
			report_admin: ['reports', 'learn'],
			state_manager: ['reports', 'learn'],
			district_manager: ['reports', 'learn'],
			admin: allFeatures.map((f) => f.code),
			org_admin: allFeatures.map((f) => f.code),
		}

		// ✅ Create a lookup map for enabled features per organization
		const orgFeaturesMap = new Map()
		organizationsFeatures.forEach((item) => {
			const orgKey = `${item.organization_code}|${item.tenant_code}`
			if (!orgFeaturesMap.has(orgKey)) {
				orgFeaturesMap.set(orgKey, new Set())
			}
			orgFeaturesMap.get(orgKey).add(item.feature_code)
		})

		// Extract unique organizations
		const uniqueOrgsMap = new Map()
		organizationsFeatures.forEach((item) => {
			const key = `${item.organization_code}|${item.tenant_code}`
			if (!uniqueOrgsMap.has(key)) {
				uniqueOrgsMap.set(key, {
					organization_code: item.organization_code,
					tenant_code: item.tenant_code,
				})
			}
		})
		const uniqueOrgs = Array.from(uniqueOrgsMap.values())

		console.log(`Total organization_features rows: ${organizationsFeatures.length}`)
		console.log(`Unique organizations: ${uniqueOrgs.length}`)

		const featureRoleMappingData = []
		const seenMappings = new Set()
		const skippedMappings = []

		for (const org of uniqueOrgs) {
			const orgKey = `${org.organization_code}|${org.tenant_code}`
			const enabledFeatures = orgFeaturesMap.get(orgKey) || new Set()

			const tenantRoles = await queryInterface.sequelize.query(
				'SELECT title FROM user_roles WHERE tenant_code = ? AND deleted_at IS NULL',
				{
					replacements: [org.tenant_code],
					type: Sequelize.QueryTypes.SELECT,
				}
			)
			const tenantRoleTitles = tenantRoles.map((role) => role.title)

			for (const [role, features] of Object.entries(roleMappings)) {
				if (tenantRoleTitles.includes(role)) {
					for (const featureCode of features) {
						const key = `${featureCode}|${role}|${org.organization_code}|${org.tenant_code}`

						// ✅ Check if feature exists in organization_features
						if (!enabledFeatures.has(featureCode)) {
							skippedMappings.push({
								reason: 'Feature not enabled for org',
								feature: featureCode,
								role: role,
								org: org.organization_code,
								tenant: org.tenant_code,
							})
							continue // Skip this mapping
						}

						if (!seenMappings.has(key)) {
							seenMappings.add(key)
							featureRoleMappingData.push({
								role_title: role,
								feature_code: featureCode,
								organization_code: org.organization_code,
								tenant_code: org.tenant_code,
								created_at: new Date(),
								updated_at: new Date(),
							})
						}
					}
				}
			}
		}

		console.log(`Total mappings to insert: ${featureRoleMappingData.length}`)
		console.log(`Skipped mappings: ${skippedMappings.length}`)

		// Log first few skipped for debugging
		if (skippedMappings.length > 0) {
			console.log('Sample skipped mappings:')
			console.log(skippedMappings.slice(0, 10))
		}

		if (featureRoleMappingData.length > 0) {
			await queryInterface.bulkInsert('feature_role_mapping', featureRoleMappingData)
		}
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('feature_role_mapping', null, {})
	},
}
