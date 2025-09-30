// 20250925120000-update-unique-user-roles.js
module.exports = {
	up: async (queryInterface, Sequelize) => {
		const table = 'user_roles'

		// drop old constraint if it exists
		await queryInterface.sequelize.query(
			`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS unique_title_org_id_tenant_code;`
		)

		// create partial unique index ignoring soft-deleted rows
		await queryInterface.sequelize.query(
			`CREATE UNIQUE INDEX IF NOT EXISTS unique_title_org_id_tenant_code 
       ON "${table}" (title, organization_id, tenant_code) 
       WHERE deleted_at IS NULL;`
		)
	},

	down: async (queryInterface, Sequelize) => {
		const table = 'user_roles'

		// drop the partial index
		await queryInterface.sequelize.query(`DROP INDEX IF EXISTS unique_title_org_id_tenant_code;`)

		// restore original constraint (no WHERE clause)
		await queryInterface.addConstraint(table, {
			fields: ['title', 'organization_id', 'tenant_code'],
			type: 'unique',
			name: 'unique_title_org_id_tenant_code',
		})
	},
}
