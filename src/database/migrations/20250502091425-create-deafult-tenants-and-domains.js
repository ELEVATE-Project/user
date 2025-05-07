'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const now = new Date()

		// Insert into tenants
		await queryInterface.bulkInsert('tenants', [
			{
				code: 'default',
				name: 'Default Tenant',
				status: 'active',
				description: 'This is the default tenant.',
				logo: 'https://example.com/logo.png',
				theming: JSON.stringify({
					primaryColor: '#4F46E5',
					secondaryColor: '#F97316',
				}),
				meta: JSON.stringify({ plan: 'free' }),
				created_by: null,
				updated_by: null,
				created_at: now,
				updated_at: now,
				deleted_at: null,
			},
		])

		// Insert into tenant_domains
		await queryInterface.bulkInsert('tenant_domains', [
			{
				id: 1,
				tenant_code: 'default',
				domain: '*',
				verified: true,
				created_at: now,
				updated_at: now,
				deleted_at: null,
			},
		])
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('tenant_domains', { tenant_code: 'default' })
		await queryInterface.bulkDelete('tenants', { code: 'default' })
	},
}
