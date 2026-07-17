'use strict'

const common = require('@constants/common')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('tenants', 'configuration', {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: common.DEFAULT_TENANT_CONFIGURATION,
		})

		await queryInterface.sequelize.query(
			`UPDATE tenants
			 SET configuration = :configuration
			 WHERE configuration IS NULL`,
			{
				replacements: {
					configuration: JSON.stringify(common.DEFAULT_TENANT_CONFIGURATION),
				},
			}
		)
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('tenants', 'configuration')
	},
}
