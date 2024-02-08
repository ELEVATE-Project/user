'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Update entities with value 'PUBLISHED' to 'Upcoming'
		await queryInterface.bulkUpdate('entities', { label: 'Upcoming' }, { value: 'PUBLISHED' })
	},

	async down(queryInterface, Sequelize) {
		// Revert the update if needed (rollback)
		await queryInterface.bulkUpdate('entities', { label: 'Published' }, { label: 'Upcoming' })
	},
}
