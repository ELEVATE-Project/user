let categories = [
	{
		value: 'sqaa',
		label: 'SQAA',
		image: 'entity/SQAA.jpg',
	},
	{
		value: 'communication',
		label: 'Communication',
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
		categories.forEach(async function (category) {
			category['status'] = 'ACTIVE'
			category['deleted'] = false
			category['type'] = 'categories'
			category['updatedAt'] = moment().format()
			category['createdAt'] = moment().format()
			category['createdBy'] = 'SYSTEM'
			category['updatedBy'] = 'SYSTEM'
			entityData.push(category)
		})
		await db.collection('entities').insertMany(entityData)
	},

	async down(db) {
		db.collection('entities').deleteMany({
			value: { $in: categories.map((category) => category.value) },
		})
	},
}
