'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		await queryInterface.addColumn('user_roles', 'visiblity', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'PUBLIC',
		})
		await queryInterface.addColumn('user_roles', 'organization_id', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: defaultOrgId,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('user_roles', 'visiblity')
		await queryInterface.removeColumn('user_roles', 'organization_id')
	},
}
