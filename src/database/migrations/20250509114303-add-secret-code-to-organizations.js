'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		// Add the secretCode column
		await queryInterface.addColumn('organizations', 'secret_code', {
			type: Sequelize.STRING(32),
			allowNull: true,
		})

		// Add a composite unique constraint on secretCode and tenantCode
		await queryInterface.addConstraint('organizations', {
			fields: ['secret_code', 'tenant_code'],
			type: 'unique',
			name: 'unique_secret_code_tenant_code',
		})
	},

	async down(queryInterface, Sequelize) {
		// Remove the composite unique constraint
		await queryInterface.removeConstraint('organizations', 'unique_secret_code_tenant_code')

		// Remove the secretCode column
		await queryInterface.removeColumn('organizations', 'secret_code')
	},
}
