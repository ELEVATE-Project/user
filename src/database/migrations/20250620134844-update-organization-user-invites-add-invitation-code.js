'use strict'
const tableName = 'organization_user_invites'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			await queryInterface.sequelize.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`)
			await queryInterface.sequelize.query(`TRUNCATE TABLE invitations RESTART IDENTITY CASCADE;`)
			console.log(`Table ${tableName} and invitations truncated successfully.`)
		} catch (error) {
			console.error(`Error truncating table ${tableName}:`, error.message)
			throw error // Re-throw to fail migration on error
		}
		await queryInterface.addColumn(tableName, 'invitation_code', {
			type: Sequelize.STRING(255),
			allowNull: false,
		})
		// Add unique constraint on invitation_code and tenant_code
		await queryInterface.addConstraint(tableName, {
			fields: ['invitation_code', 'tenant_code'],
			type: 'unique',
			name: 'invitations_invitation_code_tenant_code_unique',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeConstraint(tableName, 'invitations_invitation_code_tenant_code_unique')
		await queryInterface.removeColumn(tableName, 'invitation_code')
	},
}
