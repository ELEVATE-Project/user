'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Fetch all enabled features for all organizations from the `organization_features` table.
		const organizationsFeatures = await queryInterface.sequelize.query(
			'SELECT feature_code, tenant_code, organization_code FROM organization_features WHERE deleted_at IS NULL',
			{ type: Sequelize.QueryTypes.SELECT }
		)

		// Fetch all possible features available in the system.
		const allFeatures = await queryInterface.sequelize.query('SELECT code FROM features', {
			type: Sequelize.QueryTypes.SELECT,
		})
		// Define a baseline set of default features.
		let defaultFeatures = ['project', 'mentoring', 'survey', 'observation', 'reports', 'mitra', 'programs']
		// Define the feature set for each user role. This is the core mapping logic.
		const roleMappings = {
			content_creator: ['scp', ...defaultFeatures],
			reviewer: ['scp', 'learn', ...defaultFeatures],
			creator: ['scp', 'learn', ...defaultFeatures],
			rollout_manager: ['scp', ...defaultFeatures],
			program_manager: ['scp', ...defaultFeatures],
			program_designer: ['scp', ...defaultFeatures],
			learner: ['learn', ...defaultFeatures],
			mentee: defaultFeatures,
			mentor: ['mentoring', ...defaultFeatures],
			session_manager: ['mentoring', ...defaultFeatures],
			report_admin: ['reports', 'learn', ...defaultFeatures],
			state_manager: ['reports', 'learn', ...defaultFeatures],
			district_manager: ['reports', 'learn', ...defaultFeatures],
			admin: allFeatures.map((f) => f.code), // Admins get all features.
			org_admin: allFeatures.map((f) => f.code), // Org admins also get all features.
		}

		// Create a lookup map (`orgFeaturesMap`) for efficient access to enabled features per organization.
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

		// Prepare arrays to collect mappings and track duplicates/skipped
		const featureRoleMappingData = []
		const seenMappings = new Set()
		const skippedMappings = []

		// Main loop: Process each organization to create feature-role mappings
		for (const org of uniqueOrgs) {
			const orgKey = `${org.organization_code}|${org.tenant_code}`
			const enabledFeatures = orgFeaturesMap.get(orgKey) || new Set()

			// Fetch roles available for this tenant
			const tenantRoles = await queryInterface.sequelize.query(
				'SELECT title FROM user_roles WHERE tenant_code = ? AND deleted_at IS NULL',
				{
					replacements: [org.tenant_code],
					type: Sequelize.QueryTypes.SELECT,
				}
			)
			const tenantRoleTitles = tenantRoles.map((role) => role.title)

			// Loop through each role and its features
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

		// Insert all valid mappings into the database
		if (featureRoleMappingData.length > 0) {
			await queryInterface.bulkInsert('feature_role_mapping', featureRoleMappingData)
		}
	},

	// Revert the migration by deleting all feature-role mappings
	async down(queryInterface) {
		await queryInterface.bulkDelete('feature_role_mapping', null, {})
	},
}
