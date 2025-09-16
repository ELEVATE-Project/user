'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const now = new Date()
		const t = await queryInterface.sequelize.transaction()

		const DEFAULT_TENANT_CODE = process.env.DEFAULT_TENANT_CODE
		const DEFAULT_ORG_CODE = process.env.DEFAULT_ORGANISATION_CODE

		try {
			// ensure organization exists
			const orgExists = await queryInterface.rawSelect(
				'organizations',
				{ where: { code: DEFAULT_ORG_CODE }, transaction: t },
				'id'
			)

			if (!orgExists) {
				// nothing to do if org missing
				await t.commit()
				return
			}

			// fetch features
			const [features] = await queryInterface.sequelize.query(
				'SELECT code, label, icon, display_order FROM features;',
				{ transaction: t }
			)

			if (!features || features.length === 0) {
				await t.commit()
				return
			}

			const rowsToInsert = []

			for (const f of features) {
				// skip if already present
				const exists = await queryInterface.rawSelect(
					'organization_features',
					{
						where: {
							organization_code: DEFAULT_ORG_CODE,
							feature_code: f.code,
							tenant_code: DEFAULT_TENANT_CODE,
						},
						transaction: t,
					},
					'id'
				)

				if (!exists) {
					rowsToInsert.push({
						organization_code: DEFAULT_ORG_CODE,
						feature_code: f.code,
						enabled: true,
						feature_name: f.label,
						icon: f.icon || null,
						tenant_code: DEFAULT_TENANT_CODE,
						created_at: now,
						updated_at: now,
						display_order: f.display_order || null,
					})
				}
			}

			if (rowsToInsert.length > 0) {
				await queryInterface.bulkInsert('organization_features', rowsToInsert, { transaction: t })
			}

			await t.commit()
		} catch (err) {
			await t.rollback()
			console.error('organization_features migration failed:', err)
			throw err
		}
	},

	down: async (queryInterface, Sequelize) => {
		const t = await queryInterface.sequelize.transaction()
		const DEFAULT_TENANT_CODE = process.env.DEFAULT_TENANT_CODE
		const DEFAULT_ORG_CODE = process.env.DEFAULT_ORGANISATION_CODE
		try {
			await queryInterface.bulkDelete(
				'organization_features',
				{ organization_code: DEFAULT_ORG_CODE, tenant_code: DEFAULT_TENANT_CODE },
				{ transaction: t }
			)
			await t.commit()
		} catch (err) {
			await t.rollback()
			console.error('organization_features rollback failed:', err)
			throw err
		}
	},
}
