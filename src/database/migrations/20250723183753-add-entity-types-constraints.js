'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			// Drop existing UNIQUE constraint
			await queryInterface.sequelize.query(
				`
        ALTER TABLE entities
        DROP CONSTRAINT IF EXISTS unique_entities_value_type_tenant;
      `,
				{ transaction }
			)

			// Add partial unique index
			await queryInterface.sequelize.query(
				`
        CREATE UNIQUE INDEX unique_entities_value_type_tenant
        ON entities (value, entity_type_id, tenant_code)
        WHERE deleted_at IS NULL;
      `,
				{ transaction }
			)

			// Add unique constraint on entity_types
			await queryInterface.addConstraint('entity_types', {
				fields: ['id', 'organization_code', 'tenant_code'],
				type: 'unique',
				name: 'unique_entity_types_id_org_tenant',
				transaction,
			})

			// Add foreign key constraint from entities
			await queryInterface.addConstraint('entities', {
				fields: ['entity_type_id', 'organization_code', 'tenant_code'],
				type: 'foreign key',
				name: 'fk_entities_to_entity_types_composite',
				references: {
					table: 'entity_types',
					fields: ['id', 'organization_code', 'tenant_code'],
				},
				onDelete: 'CASCADE',
				onUpdate: 'NO ACTION',
				transaction,
			})

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			// Remove foreign key constraint
			await queryInterface.removeConstraint('entities', 'fk_entities_to_entity_types_composite', { transaction })

			// Remove unique constraint from entity_types
			await queryInterface.removeConstraint('entity_types', 'unique_entity_types_id_org_tenant', { transaction })

			// Remove partial unique index from entities
			await queryInterface.sequelize.query(`DROP INDEX IF EXISTS unique_entities_value_type_tenant;`, {
				transaction,
			})

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
}
