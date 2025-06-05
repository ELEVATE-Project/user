'use strict'
module.exports = (sequelize, DataTypes) => {
	const Invitation = sequelize.define(
		'Invitation',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			file_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			editable_fields: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true,
				defaultValue: null,
			},
			valid_till: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			created_by: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			organization_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
			tenant_code: {
				type: DataTypes.STRING(255),
				allowNull: true,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			deleted_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: 'Invitation',
			tableName: 'invitations',
			freezeTableName: true,
			paranoid: true,
		}
	)

	return Invitation
}
