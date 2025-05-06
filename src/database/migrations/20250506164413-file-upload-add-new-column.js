'use strict'
const tableName = 'file_uploads'
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Add tenant_code column as nullable
		await queryInterface.addColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})
		console.log('TENANT CODE ADDED ')
		// Set default value for existing records
		await queryInterface.sequelize.query(`
            UPDATE ${tableName} SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
        `)

		console.log('TENANT DEFAULT ADDED ')

		await queryInterface.changeColumn(tableName, 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: false,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn(tableName, 'tenant_code')
	},
}
