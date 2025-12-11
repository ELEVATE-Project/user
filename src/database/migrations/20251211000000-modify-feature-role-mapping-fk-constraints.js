'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		try {
			console.log('Removing existing foreign key constraints...')

			// Remove the existing FK constraint: feature_code → features(code)
			await queryInterface.sequelize
				.query(
					`
				ALTER TABLE feature_role_mapping
				DROP CONSTRAINT IF EXISTS fk_feature_role_mapping_feature_code;
			`
				)
				.catch(() => {
					console.warn(
						'Warning: fk_feature_role_mapping_feature_code constraint not found or already removed'
					)
				})

			// Remove the existing composite FK: (organization_code, tenant_code) → organizations
			await queryInterface.sequelize
				.query(
					`
				ALTER TABLE feature_role_mapping
				DROP CONSTRAINT IF EXISTS fk_feature_role_mapping_organization_code;
			`
				)
				.catch(() => {
					console.warn(
						'Warning: fk_feature_role_mapping_organization_code constraint not found or already removed'
					)
				})

			// Remove the existing composite FK: (feature_code, tenant_code, organization_code) → organization_features
			await queryInterface.sequelize
				.query(
					`
				ALTER TABLE feature_role_mapping
				DROP CONSTRAINT IF EXISTS fk_org_feature_role_mapping_organization_code;
			`
				)
				.catch(() => {
					console.warn(
						'Warning: fk_org_feature_role_mapping_organization_code constraint not found or already removed'
					)
				})

			console.log('Creating new foreign key constraints with NO ACTION...')

			// Recreate composite FK: (organization_code, tenant_code) → organizations with NO ACTION
			await queryInterface.sequelize.query(`
				ALTER TABLE feature_role_mapping
				ADD CONSTRAINT fk_feature_role_mapping_organization_code
				FOREIGN KEY (organization_code, tenant_code)
				REFERENCES organizations (code, tenant_code)
				ON UPDATE NO ACTION
				ON DELETE NO ACTION;
			`)

			// Recreate composite FK: (feature_code, tenant_code, organization_code) → organization_features with NO ACTION
			await queryInterface.sequelize.query(`
				ALTER TABLE feature_role_mapping
				ADD CONSTRAINT fk_org_feature_role_mapping_organization_code
				FOREIGN KEY (feature_code, tenant_code, organization_code)
				REFERENCES organization_features (feature_code, tenant_code, organization_code)
				ON UPDATE NO ACTION
				ON DELETE NO ACTION;
			`)

			console.log('Foreign key constraints successfully modified to NO ACTION')
		} catch (error) {
			console.error('Migration failed:', error)
			throw error
		}
	},

	async down(queryInterface) {
		try {
			console.log('Removing NO ACTION constraints (manual recreation of CASCADE constraints may be needed)...')

			// Remove NO ACTION constraints
			await queryInterface.sequelize
				.query(
					`
				ALTER TABLE feature_role_mapping
				DROP CONSTRAINT IF EXISTS fk_feature_role_mapping_feature_code;
			`
				)
				.catch(() => {})

			await queryInterface.sequelize
				.query(
					`
				ALTER TABLE feature_role_mapping
				DROP CONSTRAINT IF EXISTS fk_feature_role_mapping_organization_code;
			`
				)
				.catch(() => {})

			await queryInterface.sequelize
				.query(
					`
				ALTER TABLE feature_role_mapping
				DROP CONSTRAINT IF EXISTS fk_org_feature_role_mapping_organization_code;
			`
				)
				.catch(() => {})

			console.log('Constraints removed. Run previous migration to restore CASCADE constraints.')
		} catch (error) {
			console.error('Rollback failed:', error)
			throw error
		}
	},
}
