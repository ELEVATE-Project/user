'use strict'
const tableName = 'entities'
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// 1. Add as nullable
		await queryInterface.addColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// 2. Set value for existing records
		await queryInterface.sequelize.query(`
      UPDATE ${tableName} SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
    `)
		// 3. Change column to not allow nulls
		await queryInterface.changeColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: false,
		})
		// drop existing PK from entities
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
    `)
		// add new PK to the entities table
		await queryInterface.sequelize.query(`
      ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id" , "tenant_code")
    `)
		// add unique constrain
		await queryInterface.addConstraint(tableName, {
			fields: ['value', 'entity_type_id', 'organization_id', 'tenant_code'],
			type: 'unique',
			name: 'unique_value_entity_type_id_org_id_tenant_code',
		})
	},

	down: async (queryInterface, Sequelize) => {
		// drop existing PK from entities
		await queryInterface.sequelize.query(`
        ALTER TABLE "${tableName}" DROP CONSTRAINT "${tableName}_pkey"
      `)
		await queryInterface.removeConstraint(tableName, 'unique_value_entity_type_id_org_id_tenant_code')
		await queryInterface.removeColumn(tableName, 'tenant_code')
	},
}
