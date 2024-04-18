const formsData = require('@database/queries/form')
const { faker } = require('@faker-js/faker')
const usersData = require('@database/queries/users')

let bodyData
let formBody = {
	sub_type: 'profileForm',
	data: {
		template_name: 'defaultTemplate',
		fields: {
			controls: [
				{
					name: 'name',
					label: 'Your name',
					value: 'mentor',
					class: 'ion-no-margin',
					type: 'text',
					position: 'floating',
					placeHolder: 'Please enter your full name',
					errorMessage: 'This field can only contain alphabets',
					showValidationError: true,
					validators: {
						required: true,
						pattern: '^[^0-9!@#%$&()\\-`.+,/"]*$',
					},
					options: [],
				},
				{
					name: 'location',
					label: 'Select your location',
					value: [
						{
							value: 'AP',
							label: 'Andhra Pradesh',
						},
					],
					class: 'ion-no-margin',
					type: 'select',
					position: 'floating',
					errorLabel: 'Location',
					errorMessage: 'Please select your location',
					validators: {
						required: true,
					},
					options: [
						{
							value: 'AP',
							label: 'Andhra Pradesh',
						},
						{
							value: 'AR',
							label: 'Arunachal Pradesh',
						},
						{
							value: 'As',
							label: 'Assam',
						},
						{
							value: 'BR',
							label: 'Bihar',
						},
						{
							value: 'CG',
							label: 'Chhattisgarh',
						},
						{
							value: 'GA',
							label: 'Goa',
						},
						{
							value: 'GJ',
							label: 'Gujarat',
						},
						{
							value: 'HR',
							label: 'Haryana',
						},
						{
							value: 'HP',
							label: 'Himachal Pradesh',
						},
						{
							value: 'JH',
							label: 'Jharkhand',
						},
						{
							value: 'KN',
							label: 'Karnataka',
						},
						{
							value: 'KL',
							label: 'Kerala',
						},
						{
							value: 'MP',
							label: 'Madhya Pradesh',
						},
						{
							value: 'MH',
							label: 'Maharashtra',
						},
						{
							value: 'MN',
							label: 'Manipur',
						},
						{
							value: 'ML',
							label: 'Meghalaya',
						},
						{
							value: 'MZ',
							label: 'Mizoram',
						},
						{
							value: 'NL',
							label: 'Nagaland',
						},
						{
							value: 'OD',
							label: 'Odisha',
						},
						{
							value: 'PB',
							label: 'Punjab',
						},
						{
							value: 'RJ',
							label: 'Rajasthan',
						},
						{
							value: 'SK',
							label: 'Sikkim',
						},
						{
							value: 'TN',
							label: 'Tamil Nadu',
						},
						{
							value: 'TS',
							label: 'Telangana',
						},
						{
							value: 'TR',
							label: 'Tripura',
						},
						{
							value: 'UP',
							label: 'Uttar Pradesh',
						},
						{
							value: 'UK',
							label: 'Uttarakhand',
						},
						{
							value: 'WB',
							label: 'West Bengal',
						},
					],
				},
				{
					name: 'designation',
					label: 'Your role',
					class: 'ion-no-margin',
					value: [
						{
							value: 'teacher',
							label: 'Teacher',
						},
						{
							value: 'HM',
							label: 'Head master',
						},
					],
					type: 'chip',
					position: '',
					disabled: false,
					showSelectAll: true,
					errorLabel: 'Designation',
					errorMessage: 'Enter your role',
					addNewPopupHeader: 'Add a new role',
					validators: {
						required: true,
					},
					showAddOption: true,
					options: [
						{
							value: 'teacher',
							label: 'Teacher',
						},
						{
							value: 'HM',
							label: 'Head master',
						},
						{
							value: 'BEO',
							label: 'Block education officer',
						},
						{
							value: 'DEO',
							label: 'District education officer',
						},
					],
				},
				{
					name: 'experience',
					label: 'Your experience in years',
					value: '10',
					class: 'ion-no-margin',
					type: 'text',
					position: 'floating',
					placeHolder: 'Ex. 5 years',
					errorMessage: 'Enter your experience in years',
					isNumberOnly: true,
					validators: {
						required: true,
						maxLength: 2,
					},
					options: [],
				},
				{
					name: 'about',
					label: 'Tell us about yourself',
					value: 'mentor',
					class: 'ion-no-margin',
					type: 'textarea',
					position: 'floating',
					errorMessage: 'This field cannot be empty',
					placeHolder: 'Please use only 150 character',
					validators: {
						required: true,
						maxLength: 150,
					},
					options: [],
				},
				{
					name: 'areasOfExpertise',
					label: 'Your expertise',
					class: 'ion-no-margin',
					value: [
						{
							value: 'eduLdship',
							label: 'Educational leadership',
						},
					],
					type: 'chip',
					position: '',
					disabled: false,
					showSelectAll: true,
					errorLabel: 'Expertise',
					errorMessage: 'Enter your expertise',
					addNewPopupHeader: 'Add your expertise',
					validators: {
						required: true,
					},
					showAddOption: true,
					options: [
						{
							value: 'eduLdship',
							label: 'Educational leadership',
						},
						{
							value: 'schoolProcess',
							label: 'School process',
						},
					],
				},
				{
					name: 'educationQualification',
					label: 'Education qualification',
					value: 'mentor',
					class: 'ion-no-margin',
					type: 'text',
					position: 'floating',
					errorLabel: 'Education qualification',
					errorMessage: 'Enter education qualification',
					placeHolder: 'Ex. BA, B.ED',
					validators: {
						required: true,
					},
					options: [],
				},
				{
					name: 'languages',
					label: 'Languages',
					class: 'ion-no-margin',
					value: [
						{
							value: 'english',
							label: 'English',
						},
					],
					type: 'chip',
					position: '',
					disabled: false,
					showSelectAll: true,
					errorLabel: 'Medium',
					errorMessage: 'Enter language',
					addNewPopupHeader: 'Add new language',
					validators: {
						required: true,
					},
					showAddOption: true,
					options: [
						{
							value: 'english',
							label: 'English',
						},
						{
							value: 'hindi',
							label: 'Hindi',
						},
					],
				},
			],
		},
	},
}

const insertForm = async () => {
	try {
		let type = faker.random.alpha(5)
		bodyData = {
			type: type,
			...formBody,
		}

		await formsData.create(bodyData)

		return type
	} catch (error) {
		console.error(error)
	}
}

module.exports = {
	insertForm,
	formBody,
}
