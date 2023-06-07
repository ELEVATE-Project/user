'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('users', {
			fields: ['organization_id'],
			type: 'foreign key',
			name: 'fk_users_organization_id',
			references: {
				table: 'organizations',
				field: 'id',
			},
			onDelete: 'cascade',
			onUpdate: 'cascade',
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeConstraint('users', 'fk_users_organization_id')
	},
}
