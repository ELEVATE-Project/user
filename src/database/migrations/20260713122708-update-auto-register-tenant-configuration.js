'use strict'

const common = require('@constants/common')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('tenants', 'configuration', {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: common.DEFAULT_TENANT_CONFIGURATION,
		})

		await queryInterface.sequelize.query(
			`UPDATE tenants
			 SET configuration = jsonb_set(configuration, '{auto_register}', 'false'::jsonb)`
		)
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('tenants', 'configuration', {
			type: Sequelize.JSONB,
			allowNull: false,
			defaultValue: {
				allowed_auth_mode: ['otp', 'password'],
				auto_register: true,
			},
		})

		await queryInterface.sequelize.query(
			`UPDATE tenants
			 SET configuration = jsonb_set(configuration, '{auto_register}', 'true'::jsonb)`
		)
	},
}
