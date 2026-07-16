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
				meta: null,
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'project',
				label: 'Project',
				description: 'Project capability',
				meta: {
					url: '/ml/listing/project?type=project',
					icon: '/assets/images/ic_project.png',
					theme: {
						primaryColor: '#572E91',
						secondaryColor: '#FF9911',
					},
					title: 'Projects',
					sameOrigin: true,
				},
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'mentoring',
				label: 'Mentoring',
				description: 'Mentoring capability',
				meta: {
					url: '/mentoring/tabs/home',
					icon: '/assets/images/ic_mentoring.svg',
					theme: {
						primaryColor: '#572E91',
						secondaryColor: '#FF9911',
					},
					title: 'Mentoring',
					sameOrigin: true,
				},
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'survey',
				label: 'Survey',
				description: 'Survey capability',
				meta: {
					url: '/ml/listing/survey?type=survey',
					icon: '/assets/images/ic_survey.png',
					theme: {
						primaryColor: '#572E91',
						secondaryColor: '#FF9911',
					},
					title: 'Survey',
					sameOrigin: true,
				},
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'observation',
				label: 'Observation',
				description: 'Observation capability',
				meta: {
					url: '/ml/observation?type=listing',
					icon: '/assets/images/ic_observation.svg',
					theme: {
						primaryColor: '#572E91',
						secondaryColor: '#FF9911',
					},
					title: 'Observations',
					sameOrigin: true,
				},
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'reports',
				label: 'Reports',
				description: 'Reports capability',
				meta: {
					url: '/ml/report/list?type=report',
					icon: '/assets/images/ic_report.png',
					theme: {
						primaryColor: '#572E91',
						secondaryColor: '#FF9911',
					},
					sameOrigin: true,
					title: 'Reports',
				},
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'mitra',
				label: 'MITRA',
				description: 'mitra capability',
				meta: {
					url: '{{mitra_url}}/mohini/sso?accToken=',
					icon: '/assets/images/ic_mitra.svg',
					theme: {
						primaryColor: '#572E91',
						secondaryColor: '#FF9911',
					},
					title: 'MITRA',
					sameOrigin: false,
				},
				created_at: moment().format(),
				updated_at: moment().format(),
			},
			{
				code: 'programs',
				label: 'Programs',
				description: 'program capability',
				meta: {
					url: '/ml/listing/program?type=program',
					icon: '/assets/images/ic_program.png',
					theme: {
						primaryColor: '#572E91',
						secondaryColor: '#FF9911',
					},
					title: 'Programs',
					sameOrigin: true,
				},
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
