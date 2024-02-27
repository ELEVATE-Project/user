'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		await queryInterface.addColumn('user_roles', 'visibility', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'PUBLIC',
		})
		await queryInterface.addColumn('user_roles', 'organization_id', {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: defaultOrgId,
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('user_roles', 'visibility')
		await queryInterface.removeColumn('user_roles', 'organization_id')
	},
}
