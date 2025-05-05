'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// 1. Add as nullable
		await queryInterface.addColumn('entities', 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: true,
		})

		// 2. Set value for existing records
		await queryInterface.sequelize.query(`
      UPDATE entities SET tenant_code = '${process.env.DEFAULT_TENANT_CODE}'
    `)
		// 3. Change column to not allow nulls
		await queryInterface.changeColumn('entities', 'tenant_code', {
			type: Sequelize.STRING,
			allowNull: false,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('entities', 'tenant_code')
	},
}
