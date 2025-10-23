'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Check if SCP feature already exists
		const scpFeature = await queryInterface.sequelize.query("SELECT code FROM features WHERE code = 'scp'", {
			type: Sequelize.QueryTypes.SELECT,
		})

		// Insert SCP feature if it doesn't exist
		if (scpFeature.length === 0) {
			await queryInterface.bulkInsert('features', [
				{
					code: 'scp',
					label: 'Self Creation Portal',
					display_order: 9,
					description: 'SCP capability',
					created_at: new Date(),
					updated_at: new Date(),
				},
			])
		}

		// Get all organizations
		const tenants = await queryInterface.sequelize.query('SELECT code FROM tenants WHERE deleted_at IS NULL', {
			type: Sequelize.QueryTypes.SELECT,
		})

		// Get default orgs for each organization
		const organizationFeatureData = []
		for (const tenant of tenants) {
			const orgExist = await queryInterface.sequelize.query(
				'SELECT code, tenant_code FROM organizations WHERE deleted_at IS NULL AND tenant_code = :tenantCode AND code = :orgCode',
				{
					replacements: {
						tenantCode: tenant.code,
						orgCode: process.env.DEFAULT_ORGANISATION_CODE || 'default_code',
					},
					type: Sequelize.QueryTypes.SELECT,
				}
			)

			if (orgExist.length > 0) {
				const orgFeatureExist = await queryInterface.sequelize.query(
					'SELECT organization_code FROM organization_features WHERE tenant_code = :tenantCode AND organization_code = :orgCode AND feature_code = :featureCode',
					{
						replacements: {
							tenantCode: tenant.code,
							orgCode: process.env.DEFAULT_ORGANISATION_CODE || 'default_code',
							featureCode: 'scp',
						},
						type: Sequelize.QueryTypes.SELECT,
					}
				)
				if (orgFeatureExist.length === 0) {
					organizationFeatureData.push({
						organization_code: process.env.DEFAULT_ORGANISATION_CODE || 'default_code',
						tenant_code: tenant.code,
						feature_code: 'scp',
						feature_name: 'SCP',
						enabled: true,
						display_order: 9,
						created_at: new Date(),
						updated_at: new Date(),
					})
				}
			}
		}

		if (organizationFeatureData.length > 0) {
			await queryInterface.bulkInsert('organization_features', organizationFeatureData)
		}
	},

	async down(queryInterface) {
		// Remove organization_feature records only for the SCP feature
		await queryInterface.bulkDelete('organization_features', {
			feature_code: 'scp',
		})

		// Remove SCP feature
		await queryInterface.bulkDelete('features', {
			code: 'scp',
		})
	},
}
