'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			await queryInterface.addConstraint('feature_role_mapping', {
				fields: ['feature_code'],
				type: 'foreign key',
				name: 'fk_feature_role_mapping_feature_code',
				references: { table: 'features', field: 'code' },
				onUpdate: 'NO ACTION',
				onDelete: 'NO ACTION',
			})
			// Composite FK: (organization_code, tenant_code) → organizations(code, tenant_code)
			await queryInterface.sequelize.query(`
				ALTER TABLE feature_role_mapping
				ADD CONSTRAINT fk_feature_role_mapping_organization_code
				FOREIGN KEY (organization_code, tenant_code)
				REFERENCES organizations (code, tenant_code)
				ON UPDATE CASCADE
				ON DELETE CASCADE;
			`)

			// Unique index ignoring soft-deleted rows
			await queryInterface.sequelize.query(`
				CREATE UNIQUE INDEX feature_role_org_tenant_unique
				ON feature_role_mapping (feature_code, role_title, organization_code, tenant_code)
				WHERE deleted_at IS NULL;
			`)

			// Composite FK: (feature_code, tenant_code, organization_code) → organization_features(...)
			await queryInterface.sequelize.query(`
				ALTER TABLE feature_role_mapping
				ADD CONSTRAINT fk_org_feature_role_mapping_organization_code
				FOREIGN KEY (feature_code, tenant_code, organization_code)
				REFERENCES organization_features (feature_code, tenant_code, organization_code)
				ON UPDATE CASCADE
				ON DELETE CASCADE;
			`)
		} catch (error) {
			console.error('Migration failed:', error)
			throw error // important so sequelize knows migration failed
		}
	},

	async down(queryInterface, Sequelize) {
		// Remove constraints safely
		await queryInterface
			.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_tenant_code')
			.catch(() => {})
		await queryInterface
			.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_organization_code')
			.catch(() => {})
		// await queryInterface.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_role_title')
		await queryInterface
			.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_feature_code')
			.catch(() => {})
		await queryInterface
			.removeConstraint('feature_role_mapping', 'fk_org_feature_role_mapping_organization_code')
			.catch(() => {})

		await queryInterface.sequelize.query('DROP INDEX IF EXISTS feature_role_org_tenant_unique;')
	},
}
