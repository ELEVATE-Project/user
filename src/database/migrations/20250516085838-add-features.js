'use strict'
const moment = require('moment')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		let masterFeatureData = [
			{
				code: 'learn',
				label: 'Learn',
				description: 'Learn capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'project',
				label: 'Project',
				description: 'Project capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'mentoring',
				label: 'Mentoring',
				description: 'Mentoring capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'survey',
				label: 'Survey',
				description: 'Survey capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'observation',
				label: 'Observation',
				description: 'Observation capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'reports',
				label: 'Reports',
				description: 'Reports capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'mitra',
				label: 'MITRA',
				description: 'mitra capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'programs',
				label: 'Programs',
				description: 'program capability',
				created_at: moment().format(),
				updated_at: moment().format(),
			},
		]

		await queryInterface.bulkInsert('features', masterFeatureData, {})
	},

	down: async (queryInterface, Sequelize) => {
		const Op = Sequelize.Op
		await queryInterface.bulkDelete(
			'features',
			{
				code: {
					[Op.in]: ['learn', 'project', 'metoring', 'survey', 'observation', 'reports'],
				},
			},
			{}
		)
	},
}
