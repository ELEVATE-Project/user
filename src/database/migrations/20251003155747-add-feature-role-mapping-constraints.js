'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Add foreign key constraint for feature_code
		await queryInterface.addConstraint('feature_role_mapping', {
			fields: ['feature_code'],
			type: 'foreign key',
			name: 'fk_feature_role_mapping_feature_code',
			references: {
				table: 'features',
				field: 'code',
			},
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		})

		// Add foreign key constraint for tenant_code
		await queryInterface.addConstraint('feature_role_mapping', {
			fields: ['tenant_code'],
			type: 'foreign key',
			name: 'fk_feature_role_mapping_tenant_code',
			references: {
				table: 'tenants', // Adjust to your actual table name
				field: 'code',
			},
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		})

		// Add composite foreign key for organization_code (organization_code, tenant_code) -> organizations (code, tenant_code)
		await queryInterface.sequelize.query(`
			ALTER TABLE feature_role_mapping
			ADD CONSTRAINT fk_feature_role_mapping_organization_code
			FOREIGN KEY (organization_code, tenant_code)
			REFERENCES organizations (code, tenant_code)
			ON UPDATE CASCADE
			ON DELETE CASCADE;
		`)

		// Add composite foreign key for role_title (tenant_code, role_title) -> user_roles (tenant_code, title)
		//commenting this as of now because of issue in user_roles table which is using the organization_id as foreign key
		// await queryInterface.sequelize.query(`
		// 	ALTER TABLE feature_role_mapping
		// 	ADD CONSTRAINT fk_feature_role_mapping_role_title
		// 	FOREIGN KEY (tenant_code, role_title)
		// 	REFERENCES user_roles (tenant_code, title)
		// 	ON UPDATE CASCADE
		// 	ON DELETE NO ACTION;
		// `)

		// Unique constraint for feature_code, role_title, organization_code, tenant_code
		await queryInterface.sequelize.query(`
			CREATE UNIQUE INDEX feature_role_org_tenant_unique
			ON feature_role_mapping (feature_code, role_title, organization_code, tenant_code)
			WHERE deleted_at IS NULL;
		`)

		await queryInterface.sequelize.query(`
			ALTER TABLE feature_role_mapping
			ADD CONSTRAINT fk_org_feature_role_mapping_organization_code
			FOREIGN KEY (feature_code, tenant_code, organization_code)
			REFERENCES organization_features (feature_code, tenant_code, organization_code)
			ON UPDATE CASCADE
			ON DELETE CASCADE;
		`)
	},

	async down(queryInterface, Sequelize) {
		// Drop foreign key constraints
		await queryInterface.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_tenant_code')
		await queryInterface.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_organization_code')
		// await queryInterface.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_role_title')
		await queryInterface.removeConstraint('feature_role_mapping', 'fk_feature_role_mapping_feature_code')
		await queryInterface.removeConstraint('feature_role_mapping', 'fk_org_feature_role_mapping_organization_code')

		await queryInterface.sequelize.query('DROP INDEX IF EXISTS feature_role_org_tenant_unique;')
	},
}
