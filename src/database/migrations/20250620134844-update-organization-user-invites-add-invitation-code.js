'use strict'
const tableName = 'organization_user_invites'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			try {
				await queryInterface.sequelize.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`, {
					transaction,
				})
				await queryInterface.sequelize.query(`TRUNCATE TABLE invitations RESTART IDENTITY CASCADE;`, {
					transaction,
				})
				console.log(`Table ${tableName} and invitations truncated successfully.`)
			} catch (error) {
				console.error(`Error truncating table ${tableName}:`, error.message)
				throw error // Re-throw to fail migration on error
			}
		})

		await queryInterface.sequelize.transaction(async (transaction) => {
			try {
				await queryInterface.sequelize.query(
					`
          ALTER TABLE "${tableName}"
          ADD COLUMN IF NOT EXISTS invitation_code VARCHAR(255),
          ALTER COLUMN invitation_key SET DATA TYPE VARCHAR(255),
          ALTER COLUMN invitation_key DROP NOT NULL;
        `,
					{ transaction }
				)
				console.log(`Column invitation_code added and invitation_key modified in ${tableName}`)
			} catch (error) {
				console.error('Error modifying table schema:', error.message)
				throw error
			}
		})

		await queryInterface.sequelize.transaction(async (transaction) => {
			try {
				// Verify tenant_code column exists
				const tableDescription = await queryInterface.describeTable(tableName, { transaction })
				if (!tableDescription.tenant_code) {
					throw new Error('Column tenant_code does not exist in table organization_user_invites')
				}

				// Add unique constraint on invitation_code and tenant_code
				await queryInterface.addConstraint(
					tableName,
					{
						fields: ['invitation_code', 'tenant_code'],
						type: 'unique',
						name: 'invitations_invitation_code_tenant_code_unique',
					},
					{ transaction }
				)
				console.log(`Unique constraint added on invitation_code and tenant_code in ${tableName}`)
			} catch (error) {
				console.error('Error adding unique constraint:', error.message)
				throw error
			}
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			try {
				// Remove the unique constraint
				await queryInterface.removeConstraint(tableName, 'invitations_invitation_code_tenant_code_unique', {
					transaction,
				})
				console.log(`Unique constraint removed from ${tableName}`)

				// Remove invitation_code column
				await queryInterface.removeColumn(tableName, 'invitation_code', { transaction })
				console.log(`Column invitation_code removed from ${tableName}`)
			} catch (error) {
				console.error('Error during migration rollback:', error.message)
				throw error
			}
		})
	},
}
