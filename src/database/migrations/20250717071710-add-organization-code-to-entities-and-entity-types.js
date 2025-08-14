'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			// 1. Add organization_code column to entities table
			await queryInterface.addColumn(
				'entities',
				'organization_code',
				{
					type: Sequelize.STRING,
					allowNull: true, // temporarily allow null for data backfill
				},
				{ transaction }
			)

			// 2. Add organization_code column to entity_types table
			await queryInterface.addColumn(
				'entity_types',
				'organization_code',
				{
					type: Sequelize.STRING,
					allowNull: true, // temporarily allow null for data backfill
				},
				{ transaction }
			)
			// 3. Backfill organization_code in entity_types from organization_id
			// Assuming there's an organizations table with id and code columns
			await queryInterface.sequelize.query(
				`
				UPDATE entity_types et
				SET organization_code = o.code
				FROM organizations o
				WHERE et.organization_id = o.id
				AND et.tenant_code = o.tenant_code
				`,
				{ transaction }
			)

			// 4. Backfill organization_code in entities from entity_types
			await queryInterface.sequelize.query(
				`
				UPDATE entities e
				SET organization_code = et.organization_code
				FROM entity_types et
				WHERE e.entity_type_id = et.id
				AND e.tenant_code = et.tenant_code
				`,
				{ transaction }
			)
			// 5. Verify backfill - check if any records still have null organization_code
			const [entitiesNullCount] = await queryInterface.sequelize.query(
				`SELECT COUNT(*) as count FROM entities WHERE organization_code IS NULL`,
				{ transaction }
			)

			const [entityTypesNullCount] = await queryInterface.sequelize.query(
				`SELECT COUNT(*) as count FROM entity_types WHERE organization_code IS NULL`,
				{ transaction }
			)

			if (entitiesNullCount[0].count > 0) {
				throw new Error(
					`Backfill failed: ${entitiesNullCount[0].count} entities still have null organization_code`
				)
			}

			if (entityTypesNullCount[0].count > 0) {
				throw new Error(
					`Backfill failed: ${entityTypesNullCount[0].count} entity_types still have null organization_code`
				)
			}

			console.log('✅ Backfill verification passed - all records have organization_code')

			// 6. Set organization_code to NOT NULL in both tables
			await queryInterface.changeColumn(
				'entities',
				'organization_code',
				{
					type: Sequelize.STRING,
					allowNull: false,
				},
				{ transaction }
			)

			await queryInterface.changeColumn(
				'entity_types',
				'organization_code',
				{
					type: Sequelize.STRING,
					allowNull: false,
				},
				{ transaction }
			)

			// 7. Remove organization_id from entity_types table
			//await queryInterface.removeColumn('entity_types', 'organization_id', { transaction })

			// 8. Remove old unique constraint on entities
			await queryInterface.removeIndex('entities', 'unique_entities_value', {
				transaction,
			})

			// 9. Add new unique constraint on entities: value + entity_type_id + organization_code +tenant_code
			await queryInterface.sequelize.query(
				`
  CREATE UNIQUE INDEX unique_entities_value_type_organization_tenant
  ON "entities" ("value", "entity_type_id", "organization_code", "tenant_code")
  WHERE deleted_at IS NULL;
  `,
				{ transaction }
			)

			await transaction.commit()
			console.log('✅ Migration completed successfully')
		} catch (err) {
			await transaction.rollback()
			console.error('❌ Migration failed:', err)
			throw err
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			// 2. Remove new unique constraint on entities
			await queryInterface.removeConstraint('entities', 'unique_entities_value_type_organization_tenant', {
				transaction,
			})

			// 3. Restore old unique constraint on entities (assuming it was only on value)
			await queryInterface.addConstraint('entities', {
				fields: ['value'],
				type: 'unique',
				name: 'unique_entities_value',
				transaction,
			})

			// 4. Add back organization_id column to entity_types
			await queryInterface.addColumn(
				'entity_types',
				'organization_id',
				{
					type: Sequelize.INTEGER,
					allowNull: true, // temporarily allow null for data restoration
				},
				{ transaction }
			)

			// 5. Restore organization_id in entity_types from organization_code
			// Assuming there's an organizations table with id and code columns
			await queryInterface.sequelize.query(
				`
				UPDATE entity_types et
				SET organization_id = o.id
				FROM organizations o
				WHERE et.organization_code = o.code
				AND et.tenant_code = o.tenant_code
				`,
				{ transaction }
			)

			// 6. Set organization_id to NOT NULL in entity_types
			await queryInterface.changeColumn(
				'entity_types',
				'organization_id',
				{
					type: Sequelize.INTEGER,
					allowNull: false,
				},
				{ transaction }
			)

			// 7. Remove organization_code columns
			await queryInterface.removeColumn('entities', 'organization_code', { transaction })
			await queryInterface.removeColumn('entity_types', 'organization_code', { transaction })

			await transaction.commit()
			console.log('✅ Migration rollback completed successfully')
		} catch (err) {
			await transaction.rollback()
			console.error('❌ Migration rollback failed:', err.message)
			throw err
		}
	},
}
