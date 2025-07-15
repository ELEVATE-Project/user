'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Step 1: Add column with allowNull: true
		await queryInterface.addColumn('features', 'display_order', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		await queryInterface.addColumn('organization_features', 'display_order', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})

		// Step 2: Seed values
		const featureOrder = ['programs', 'project', 'survey', 'observation', 'reports', 'mentoring', 'mitra']

		// Fetch all features
		const features = await queryInterface.sequelize.query(`SELECT code FROM features WHERE deleted_at IS NULL`, {
			type: Sequelize.QueryTypes.SELECT,
		})

		// Update display_order in features
		for (const feature of features) {
			const code = feature.code
			const index = featureOrder.indexOf(code)
			const displayOrder = index !== -1 ? index + 1 : featureOrder.length + 1

			await queryInterface.sequelize.query(
				`UPDATE features SET display_order = :order WHERE code = :code AND deleted_at IS NULL`,
				{
					replacements: { order: displayOrder, code },
					type: Sequelize.QueryTypes.UPDATE,
				}
			)
		}

		// Update organization_features with matching display_order
		for (const feature of features) {
			const [result] = await queryInterface.sequelize.query(
				`SELECT display_order FROM features WHERE code = :code`,
				{
					replacements: { code: feature.code },
					type: Sequelize.QueryTypes.SELECT,
				}
			)

			if (result && result.display_order !== undefined) {
				await queryInterface.sequelize.query(
					`UPDATE organization_features SET display_order = :order WHERE feature_code = :code`,
					{
						replacements: { order: result.display_order, code: feature.code },
						type: Sequelize.QueryTypes.UPDATE,
					}
				)
			}
		}

		// Step 3: Alter columns to NOT NULL
		await queryInterface.changeColumn('features', 'display_order', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})

		await queryInterface.changeColumn('organization_features', 'display_order', {
			type: Sequelize.INTEGER,
			allowNull: false,
		})
	},

	async down(queryInterface, Sequelize) {
		// Remove display_order from features table
		await queryInterface.removeColumn('features', 'display_order')

		// Remove display_order from organization_features table
		await queryInterface.removeColumn('organization_features', 'display_order')
	},
}
