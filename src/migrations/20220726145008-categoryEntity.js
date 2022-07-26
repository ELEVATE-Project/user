const entityData = [
	{
		value: 'sqaa',
		label: 'SQAA',
		status: 'ACTIVE',
		deleted: false,
		type: 'categories',
		image: 'entity/SQAA.jpg',
	},
	{
		value: 'communication',
		label: 'Communication',
		status: 'ACTIVE',
		deleted: false,
		type: 'categories',
		image: 'entity/Communication.png',
	},
	{
		value: 'defaultImage',
		label: 'Default',
		status: 'ACTIVE',
		deleted: false,
		type: 'categories',
		image: 'entity/Default.png',
	},
	{
		value: 'schoolProcess',
		label: 'School Process',
		status: 'ACTIVE',
		deleted: false,
		type: 'categories',
		image: 'entity/School-process.png',
	},
	{
		value: 'professionalDevelopment',
		label: 'Professional Development',
		status: 'ACTIVE',
		deleted: false,
		type: 'categories',
		image: 'entity/Professional-development.png',
	},
	{
		value: 'educationLeadership',
		label: 'Education Leadership',
		status: 'ACTIVE',
		deleted: false,
		type: 'categories',
		image: 'entity/Education-leadership.png',
	},
]
module.exports = {
	async up(db) {
		global.migrationMsg = 'Uploaded categories entity'
		await db.collection('entities').insertMany(entityData)
	},

	async down(db) {
		db.collection('entities').deleteMany({
			value: { $in: entityData.map((mappedEntityData) => mappedEntityData.value) },
		})
	},
}
