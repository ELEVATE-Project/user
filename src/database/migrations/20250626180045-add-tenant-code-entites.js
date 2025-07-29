'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			// 1. Add tenant_code column to entities table
			await queryInterface.addColumn(
				'entities',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: true, // temporarily allow null for data backfill
				},
				{ transaction }
			)

			// 2. Backfill tenant_code in entities from entity_types
			await queryInterface.sequelize.query(
				`
				UPDATE entities e
				SET tenant_code = et.tenant_code
				FROM entity_types et
				WHERE e.entity_type_id = et.id
				`,
				{ transaction }
			)

			// 3. Set tenant_code to NOT NULL
			await queryInterface.changeColumn(
				'entities',
				'tenant_code',
				{
					type: Sequelize.STRING,
					allowNull: false,
				},
				{ transaction }
			)

			// 4. Remove old unique constraint
			await queryInterface.removeIndex('entities', 'unique_entities_value', {
				transaction,
			})

			// 5. Add new unique constraint on value + entity_type_id + tenant_code
			await queryInterface.addConstraint('entities', {
				fields: ['value', 'entity_type_id', 'tenant_code'],
				type: 'unique',
				name: 'unique_entities_value_type_tenant',
				transaction,
			})

			// 6. Drop old primary key
			await queryInterface.removeConstraint('entities', 'entities_pkey', {
				transaction,
			})

			// 7. Add new composite primary key on id + tenant_code
			await queryInterface.addConstraint('entities', {
				fields: ['id', 'tenant_code'],
				type: 'primary key',
				name: 'entities_pkey',
				transaction,
			})

			await transaction.commit()
		} catch (err) {
			await transaction.rollback()
			throw err
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			// Revert PK
			await queryInterface.removeConstraint('entities', 'entities_pkey', { transaction })
			await queryInterface.addConstraint('entities', {
				fields: ['id', 'entity_type_id'],
				type: 'primary key',
				name: 'entities_pkey',
				transaction,
			})

			// Remove new unique constraint
			await queryInterface.removeConstraint('entities', 'unique_entities_value_type_tenant', { transaction })

			// Restore old unique constraint (assuming it was only on value)
			await queryInterface.addConstraint('entities', {
				fields: ['value'],
				type: 'unique',
				name: 'unique_entities_value',
				transaction,
			})

			// Remove tenant_code column
			await queryInterface.removeColumn('entities', 'tenant_code', { transaction })

			await transaction.commit()
		} catch (err) {
			await transaction.rollback()
			throw err
		}
	},
}
