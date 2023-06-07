'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('organizations', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			code: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			description: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			org_admin: Sequelize.ARRAY(Sequelize.INTEGER),
			parent_id: Sequelize.INTEGER,
			related_orgs: Sequelize.ARRAY(Sequelize.INTEGER),
			in_domain_visibility: Sequelize.STRING,
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('organizations')
	},
}
