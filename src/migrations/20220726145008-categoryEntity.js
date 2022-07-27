let categories = [
	{
		value: 'sqaa',
		label: 'SQAA',

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

		image: 'entity/Default.png',
	},
	{
		value: 'schoolProcess',
		label: 'School Process',

		image: 'entity/School-process.png',
	},
	{
		value: 'professionalDevelopment',
		label: 'Professional Development',

		image: 'entity/Professional-development.png',
	},
	{
		value: 'educationLeadership',
		label: 'Education Leadership',
		image: 'entity/Education-leadership.png',
	},
]
var moment = require('moment')

module.exports = {
	async up(db) {
		global.migrationMsg = 'Uploaded categories entity'
		let entityData = []
		categories.map(async function (mappedCategories) {
			let categories = mappedCategories
			categories['status'] = 'ACTIVE'
			categories['deleted'] = false
			categories['type'] = 'categories'
			categories['updatedAt'] = moment().format()
			categories['createdAt'] = moment().format()
			categories['createdBy'] = 'SYSTEM'
			categories['updatedBy'] = 'SYSTEM'
			entityData.push(categories)
		})

		await db.collection('entities').insertMany(entityData)
	},

	async down(db) {
		db.collection('entities').deleteMany({
			value: { $in: categories.map((mappedCategories) => mappedCategories.value) },
		})
	},
}
