module.exports = (sequelize, DataTypes) => {
	const forms = sequelize.define('forms', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		sub_type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		data: DataTypes.JSON,
	})
	return forms
}
