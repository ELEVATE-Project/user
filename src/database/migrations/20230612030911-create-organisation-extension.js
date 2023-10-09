'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('organisation_extension', {
			org_id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			session_visibility_policy: {
				type: Sequelize.STRING,
			},
			mentor_visibility_policy: {
				type: Sequelize.STRING,
			},
			external_session_visibility_policy: {
				type: Sequelize.STRING,
			},
			external_mentor_visibility_policy: {
				type: Sequelize.STRING,
			},
			approval_required_for: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			allow_mentor_override: {
				type: Sequelize.BOOLEAN,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('organisation_extension')
	},
}
