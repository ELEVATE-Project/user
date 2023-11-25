'use strict'
module.exports = (sequelize, DataTypes) => {
	const OrganizationRoleRequests = sequelize.define(
		'OrganizationRoleRequests',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			requester_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			role: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'REQUESTED', //REQUESTED, UNDER_REVIEW, ACCEPTED, REJECTED
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			handled_by: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			meta: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			comments: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'OrganizationRoleRequests',
			tableName: 'organization_role_requests',
			freezeTableName: true,
			paranoid: true,
		}
	)

	OrganizationRoleRequests.associate = (models) => {
		OrganizationRoleRequests.belongsTo(models.User, { as: 'requester', foreignKey: 'requester_id' })
		OrganizationRoleRequests.belongsTo(models.User, { as: 'handler', foreignKey: 'handled_by' })
	}

	return OrganizationRoleRequests
}
