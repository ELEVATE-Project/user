'use strict'

const common = require('@constants/common')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('tenants', 'configuration', {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: null,
		})

		await queryInterface.sequelize.query(
			`UPDATE tenants
			 SET configuration = jsonb_set(
        jsonb_set(configuration, '{auto_register}', 'false'::jsonb),
        '{allowed_auth_mode}', '["password"]'::jsonb
      )`
		)
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('tenants', 'configuration', {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: common.DEFAULT_TENANT_CONFIGURATION,
		})

		await queryInterface.sequelize.query(
			`UPDATE tenants
			 SET configuration = jsonb_set(
        jsonb_set(configuration, '{auto_register}', 'true'::jsonb),
        '{allowed_auth_mode}', '["otp","password"]'::jsonb)`
		)
	},
}
