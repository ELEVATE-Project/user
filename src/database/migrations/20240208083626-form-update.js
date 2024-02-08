'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		await queryInterface.bulkUpdate(
			'forms', // Replace with your actual table name
			{
				data: JSON.stringify({
					fields: {
						controls: [
							{
								name: 'title',
								label: 'Session title',
								value: '',
								class: 'ion-no-margin',
								type: 'text',
								placeHolder: 'Ex. Name of your session',
								position: 'floating',
								errorMessage: {
									required: 'Enter session title',
								},
								validators: {
									required: true,
									maxLength: 255,
								},
							},
							{
								name: 'description',
								label: 'Description',
								value: '',
								class: 'ion-no-margin',
								type: 'textarea',
								placeHolder: 'Tell the community something about your session',
								position: 'floating',
								errorMessage: {
									required: 'Enter description',
								},
								validators: {
									required: true,
									maxLength: 255,
								},
							},
							{
								name: 'type',
								label: 'Session type',
								class: 'ion-no-margin',
								type: 'select',
								dependedChild: 'mentees',
								position: 'floating',
								value: '',
								info: [
									{
										header: 'Public session',
										message: 'Discoverable. Mentees can enroll and attend',
									},
									{
										header: 'Private session',
										message: 'Non-discoverable. Invited mentee can attend',
									},
								],
								errorMessage: {
									required: 'Please select your session type',
								},
								validators: {
									required: true,
								},
								meta: {
									errorLabel: 'Location',
									disabledChildren: ['mentees', 'mentor_id'],
								},
								multiple: false,
								options: [
									{
										label: 'Private',
										value: 'PRIVATE',
									},
									{
										label: 'Public',
										value: 'PUBLIC',
									},
								],
							},
							{
								name: 'mentor_id',
								label: 'Add mentor',
								value: '',
								class: 'ion-no-margin',
								type: 'search',
								position: 'floating',
								disabled: true,
								meta: {
									multiSelect: false,
									disableIfSelected: true,
									searchLabel: 'Search for mentor',
									searchData: [],
									url: 'MENTORS_LIST',
									labelArrayForSingleSelect: ['mentor_name', 'organization.name'],
									filters: {
										entity_types: [
											{
												key: 'designation',
												label: 'Designation',
												type: 'checkbox',
											},
										],
										organizations: [
											{
												isEnabled: true,
												key: 'organizations',
												type: 'checkbox',
											},
										],
									},
								},
								info: [
									{
										message: 'Click to select Mentor for this session',
									},
								],
								errorMessage: {
									required: 'Please add a mentor for the session',
								},
								validators: {
									required: true,
								},
							},
							{
								name: 'mentees',
								label: 'Add Mentee',
								value: '',
								class: 'ion-no-margin',
								disabled: true,
								type: 'search',
								meta: {
									multiSelect: true,
									url: 'MENTEES_LIST',
									searchLabel: 'Search for mentee',
									searchData: [],
									maxCount: 'MAX_MENTEE_ENROLLMENT_COUNT',
									labelForListButton: 'View Mentee List',
									labelForAddButton: 'Add New Mentee',
									filters: {
										entity_types: [
											{
												key: 'designation',
												label: 'Designation',
												type: 'checkbox',
											},
										],
										organizations: [
											{
												isEnabled: true,
												key: 'organizations',
												type: 'checkbox',
											},
										],
									},
								},
								position: 'floating',
								info: [
									{
										message: 'Click to select Mentee(s) for this session',
									},
								],
								errorMessage: {
									required: 'Please add mentee for the session',
								},
								validators: {
									required: true,
								},
							},
							{
								name: 'start_date',
								label: 'Start date',
								class: 'ion-no-margin',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								dependedChild: 'end_date',
								type: 'date',
								placeHolder: 'YYYY-MM-DD hh:mm',
								errorMessage: {
									required: 'Enter start date',
								},
								position: 'floating',
								validators: {
									required: true,
								},
							},
							{
								name: 'end_date',
								label: 'End date',
								class: 'ion-no-margin',
								position: 'floating',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								dependedParent: 'start_date',
								type: 'date',
								placeHolder: 'YYYY-MM-DD hh:mm',
								errorMessage: {
									required: 'Enter end date',
								},
								validators: {
									required: true,
								},
							},
							{
								name: 'recommended_for',
								label: 'Recommended for',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: {
									required: 'Enter recommended for',
								},
								validators: {
									required: true,
								},
								options: [
									{
										label: 'Block education officer',
										value: 'beo',
									},
									{
										label: 'Cluster officials',
										value: 'co',
									},
									{
										label: 'District education officer',
										value: 'deo',
									},
									{
										label: 'Head master',
										value: 'hm',
									},
									{
										label: 'Teacher',
										value: 'te',
									},
								],
								meta: {
									entityType: 'recommended_for',
									addNewPopupHeader: 'Recommended for',
									addNewPopupSubHeader: 'Who is this session for?',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
							{
								name: 'categories',
								label: 'Categories',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: {
									required: 'Enter categories',
								},
								validators: {
									required: true,
								},
								options: [
									{
										label: 'Communication',
										value: 'communication',
									},
									{
										label: 'Educational leadership',
										value: 'educational_leadership',
									},
									{
										label: 'Professional development',
										value: 'professional_development',
									},
									{
										label: 'School process',
										value: 'school_process',
									},
									{
										label: 'SQAA',
										value: 'sqaa',
									},
								],
								meta: {
									entityType: 'categories',
									addNewPopupHeader: 'Add a new category',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
							{
								name: 'medium',
								label: 'Select medium',
								alertLabel: 'medium',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: {
									required: 'Enter select medium',
								},
								validators: {
									required: true,
								},
								options: [
									{
										label: 'English',
										value: 'en_in',
									},
									{
										label: 'Hindi',
										value: 'hi',
									},
								],
								meta: {
									entityType: 'medium',
									addNewPopupHeader: 'Add new language',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
						],
					},
					template_name: 'defaultTemplate',
				}),
				updated_at: new Date(),
			},

			{
				type: 'managersSession',
				sub_type: 'managersSessionForm',
				organization_id: defaultOrgId,
			}
		)
	},

	async down(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		await queryInterface.bulkUpdate(
			'forms', // Replace with your actual table name
			{
				data: JSON.stringify({
					fields: {
						controls: [
							{
								name: 'title',
								label: 'Session title',
								value: '',
								class: 'ion-no-margin',
								type: 'text',
								placeHolder: 'Ex. Name of your session',
								position: 'floating',
								errorMessage: {
									required: 'Enter session title',
								},
								validators: {
									required: true,
									maxLength: 255,
								},
							},
							{
								name: 'description',
								label: 'Description',
								value: '',
								class: 'ion-no-margin',
								type: 'textarea',
								placeHolder: 'Tell the community something about your session',
								position: 'floating',
								errorMessage: { required: 'Enter description' },
								validators: { required: true, maxLength: 255 },
							},
							{
								name: 'type',
								label: 'Session type',
								class: 'ion-no-margin',
								type: 'select',
								dependedChild: 'mentees',
								value: '',
								position: 'floating',
								info: [
									{
										header: 'Public session',
										message: 'Discoverable. Mentees can enroll and attend',
									},
									{
										header: 'Private session',
										message: 'Non-discoverable. Invited mentee can attend',
									},
								],
								errorMessage: { required: 'Please select your session type' },
								validators: { required: true },
								meta: { errorLabel: 'Location' },
								multiple: false,
								options: [
									{ label: 'Private', value: 'PRIVATE' },
									{ label: 'Public', value: 'PUBLIC' },
								],
							},
							{
								name: 'mentor_id',
								label: 'Add mentor',
								value: '',
								class: 'ion-no-margin',
								type: 'search',
								position: 'floating',
								disabled: false,
								meta: {
									multiSelect: false,
									searchLabel: 'Search for mentor',
									searchData: [],
									url: 'MENTORS_LIST',
									labelArrayForSingleSelect: ['mentor_name', 'organization.name'],
									filters: {
										entity_types: [{ key: 'designation', label: 'Designation', type: 'checkbox' }],
										organizations: [{ isEnabled: true, key: 'organizations', type: 'checkbox' }],
									},
								},
								info: [{ message: 'Click to select Mentor for this session' }],
								errorMessage: { required: 'Please add a mentor for the session' },
								validators: { required: true },
							},
							{
								name: 'mentees',
								label: 'Add Mentee',
								value: '',
								class: 'ion-no-margin',
								disabled: false,
								type: 'search',
								meta: {
									multiSelect: true,
									url: 'MENTEES_LIST',
									searchLabel: 'Search for mentee',
									searchData: [],
									maxCount: 'MAX_MENTEE_ENROLLMENT_COUNT',
									labelForListButton: 'View Mentee List',
									labelForAddButton: 'Add New Mentee',
									filters: {
										entity_types: [{ key: 'designation', label: 'Designation', type: 'checkbox' }],
										organizations: [{ isEnabled: true, key: 'organizations', type: 'checkbox' }],
									},
								},
								position: 'floating',
								info: [{ message: 'Click to select Mentee(s) for this session' }],
								errorMessage: { required: 'Please add mentee for the session' },
								validators: { required: true },
							},
							{
								name: 'start_date',
								label: 'Start date',
								class: 'ion-no-margin',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								dependedChild: 'end_date',
								type: 'date',
								placeHolder: 'YYYY-MM-DD hh:mm',
								errorMessage: { required: 'Enter start date' },
								position: 'floating',
								validators: { required: true },
							},
							{
								name: 'end_date',
								label: 'End date',
								class: 'ion-no-margin',
								position: 'floating',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								dependedParent: 'start_date',
								type: 'date',
								placeHolder: 'YYYY-MM-DD hh:mm',
								errorMessage: { required: 'Enter end date' },
								validators: { required: true },
							},
							{
								name: 'recommended_for',
								label: 'Recommended for',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: { required: 'Enter recommended for' },
								validators: { required: true },
								options: [
									{ label: 'Block education officer', value: 'beo' },
									{ label: 'Cluster officials', value: 'co' },
									{ label: 'District education officer', value: 'deo' },
									{ label: 'Head master', value: 'hm' },
									{ label: 'Teacher', value: 'te' },
								],
								meta: {
									entityType: 'recommended_for',
									addNewPopupHeader: 'Recommended for',
									addNewPopupSubHeader: 'Who is this session for?',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
							{
								name: 'categories',
								label: 'Categories',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: { required: 'Enter categories' },
								validators: { required: true },
								options: [
									{ label: 'Communication', value: 'communication' },
									{ label: 'Educational leadership', value: 'educational_leadership' },
									{ label: 'Professional development', value: 'professional_development' },
									{ label: 'School process', value: 'school_process' },
									{ label: 'SQAA', value: 'sqaa' },
								],
								meta: {
									entityType: 'categories',
									addNewPopupHeader: 'Add a new category',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
							{
								name: 'medium',
								label: 'Select medium',
								alertLabel: 'medium',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: { required: 'Enter select medium' },
								validators: { required: true },
								options: [
									{ label: 'English', value: 'en_in' },
									{ label: 'Hindi', value: 'hi' },
								],
								meta: {
									entityType: 'medium',
									addNewPopupHeader: 'Add new language',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
						],
					},
					template_name: 'defaultTemplate',
				}),
				updated_at: new Date(),
			},

			{
				type: 'managersSession',
				sub_type: 'managersSessionForm',
				organization_id: defaultOrgId,
			}
		)
	},
}
