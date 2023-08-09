'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('mentor_extensions', {
			user_id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			designation: {
				type: Sequelize.STRING,
			},
			area_of_expertise: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			education_qualification: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			rating: {
				type: Sequelize.JSON,
			},
			user_type: {
				type: Sequelize.STRING,
			},
			meta: {
				type: Sequelize.JSONB,
			},
			stats: {
				type: Sequelize.JSONB,
			},
			tags: {
				type: Sequelize.ARRAY(Sequelize.STRING),
			},
			configs: {
				type: Sequelize.JSON,
			},
			visibility: {
				type: Sequelize.STRING,
			},
			organisation_ids: {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
			},
			external_session_visibility: {
				type: Sequelize.STRING,
			},
			external_mentor_visibility: {
				type: Sequelize.STRING,
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
		await queryInterface.dropTable('mentor_extensions')
	},
}
