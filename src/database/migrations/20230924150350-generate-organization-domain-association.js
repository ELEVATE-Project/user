'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		return true
		await queryInterface.addConstraint('org_domains', {
			fields: ['organization_id'],
			type: 'foreign key',
			name: 'fk_domain_organization',
			references: {
				table: 'organizations',
				field: 'id',
			},
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeConstraint('org_domains', 'fk_domain_organization')
	},
}
