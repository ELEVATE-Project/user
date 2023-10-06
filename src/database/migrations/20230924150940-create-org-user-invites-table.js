'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('org_user_invites', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: 'ACTIVE',
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			roles: {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				allowNull: false,
			},
			file_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			created_by: {
				type: Sequelize.INTEGER,
			},
			created_at: {
				type: Sequelize.DATE,
			},
			updated_at: {
				type: Sequelize.DATE,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('org_user_invites')
	},
}
