'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Add the new 'label' column to the 'user-role' table
		await queryInterface.addColumn('user_roles', 'label', {
			type: Sequelize.STRING,
			allowNull: true, // Assuming label can be null initially
		})

		// Fetch all rows from the 'user-role' table
		const userRoles = await queryInterface.sequelize.query('SELECT id, title FROM user_roles', {
			type: queryInterface.sequelize.QueryTypes.SELECT,
		})

		// Update each row with the new label
		for (const role of userRoles) {
			const label = role.title
				.split('_')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
				.join(' ')

			await queryInterface.sequelize.query(`UPDATE user_roles SET label = :label WHERE id = :id`, {
				replacements: { label, id: role.id },
			})
		}
	},

	down: async (queryInterface, Sequelize) => {
		// Remove the 'label' column from the 'user-role' table
		await queryInterface.removeColumn('user_roles', 'label')
	},
}
