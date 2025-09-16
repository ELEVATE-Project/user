'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const now = new Date()
		const t = await queryInterface.sequelize.transaction()

		// safe env fallbacks
		const DEFAULT_TENANT_CODE = process.env.DEFAULT_TENANT_CODE
		const DEFAULT_ORG_CODE = process.env.DEFAULT_ORGANISATION_CODE
		const DEFAULT_ORG_NAME = process.env.DEFAULT_ORGANISATION_NAME || 'Default Organization'

		try {
			// Insert tenant (if not exists)
			const existingTenant = await queryInterface.rawSelect(
				'tenants',
				{ where: { code: DEFAULT_TENANT_CODE }, transaction: t },
				'id'
			)

			if (!existingTenant) {
				await queryInterface.bulkInsert(
					'tenants',
					[
						{
							code: DEFAULT_TENANT_CODE,
							name: 'Default Tenant',
							status: 'ACTIVE',
							description: 'This is the default tenant.',
							logo: 'https://www.logo.dev',
							theming: JSON.stringify({
								primaryColor: '#4F46E5',
								secondaryColor: '#F97316',
							}),
							meta: null,
							created_by: null,
							updated_by: null,
							created_at: now,
							updated_at: now,
							deleted_at: null,
						},
					],
					{ transaction: t }
				)
			}

			// Insert tenant_domain (if not exists)
			const existingDomain = await queryInterface.rawSelect(
				'tenant_domains',
				{ where: { tenant_code: DEFAULT_TENANT_CODE, domain: 'localhost' }, transaction: t },
				'id'
			)

			if (!existingDomain) {
				await queryInterface.bulkInsert(
					'tenant_domains',
					[
						{
							tenant_code: DEFAULT_TENANT_CODE,
							domain: 'localhost',
							verified: true,
							created_at: now,
							updated_at: now,
							deleted_at: null,
						},
					],
					{ transaction: t }
				)
			}

			// Insert organization if not exists
			const existingOrgId = await queryInterface.rawSelect(
				'organizations',
				{ where: { code: DEFAULT_ORG_CODE }, transaction: t },
				'id'
			)

			let insertedOrgCode = DEFAULT_ORG_CODE

			if (!existingOrgId) {
				await queryInterface.bulkInsert(
					'organizations',
					[
						{
							name: DEFAULT_ORG_NAME,
							code: DEFAULT_ORG_CODE,
							description: 'Default Organisation',
							status: 'ACTIVE',
							tenant_code: DEFAULT_TENANT_CODE,
							created_at: now,
							updated_at: now,
						},
					],
					{ transaction: t }
				)

				// get the id just inserted (DB may have returned id via serial; rawSelect by code ensures we get it)
			}

			// Fetch all features to seed organization_features
			const [features] = await queryInterface.sequelize.query('SELECT code, label, icon FROM features;', {
				transaction: t,
			})

			if (features && features.length > 0) {
				// prepare rows but skip duplicates: check existing by org + feature
				const orgFeatureRows = []

				for (const feature of features) {
					// check if already exists
					const exists = await queryInterface.rawSelect(
						'organization_features',
						{
							where: {
								organization_code: DEFAULT_ORG_CODE,
								feature_code: feature.code,
								tenant_code: DEFAULT_TENANT_CODE,
							},
							transaction: t,
						},
						'id'
					)

					if (!exists) {
						orgFeatureRows.push({
							organization_code: DEFAULT_ORG_CODE,
							feature_code: feature.code,
							enabled: true,
							feature_name: feature.label,
							icon: feature.icon || null,
							tenant_code: DEFAULT_TENANT_CODE,
							created_at: now,
							updated_at: now,
						})
					}
				}

				if (orgFeatureRows.length > 0) {
					await queryInterface.bulkInsert('organization_features', orgFeatureRows, { transaction: t })
				}
			}

			await t.commit()
		} catch (err) {
			await t.rollback()
			console.error('Migration failed:', err)
			throw err
		}
	},

	down: async (queryInterface, Sequelize) => {
		const t = await queryInterface.sequelize.transaction()
		const DEFAULT_TENANT_CODE = process.env.DEFAULT_TENANT_CODE
		const DEFAULT_ORG_CODE = process.env.DEFAULT_ORGANISATION_CODE

		try {
			// Delete seeded organization_features for this org & tenant
			await queryInterface.bulkDelete(
				'organization_features',
				{ organization_code: DEFAULT_ORG_CODE, tenant_code: DEFAULT_TENANT_CODE },
				{ transaction: t }
			)

			// Delete organization
			await queryInterface.bulkDelete('organizations', { code: DEFAULT_ORG_CODE }, { transaction: t })

			// Delete tenant_domain(s)
			await queryInterface.bulkDelete('tenant_domains', { tenant_code: DEFAULT_TENANT_CODE }, { transaction: t })

			// Delete tenant
			await queryInterface.bulkDelete('tenants', { code: DEFAULT_TENANT_CODE }, { transaction: t })

			await t.commit()
		} catch (err) {
			await t.rollback()
			console.error('Rollback failed:', err)
			throw err
		}
	},
}
