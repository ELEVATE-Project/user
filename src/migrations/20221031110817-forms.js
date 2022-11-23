let data = [
	{
		subType: 'sessionForm',
		type: 'session',
		action: 'sessionFields',
		ver: '1.6',
		data: {
			templateName: 'defaultTemplate',
			fields: {
				controls: [
					{
						name: 'title',
						label: 'Session title',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
					},
					{
						name: 'description',
						label: 'Description',
						value: '',
						class: 'ion-no-margin',
						type: 'textarea',
						position: 'floating',
						validators: {
							required: true,
						},
					},
					{
						name: 'startDate',
						label: 'Start date',
						class: 'ion-no-margin',
						value: '',
						displayFormat: 'DD/MMM/YYYY HH:mm',
						dependedChild: 'endDate',
						type: 'date',
						position: 'floating',
						validators: {
							required: true,
						},
					},
					{
						name: 'endDate',
						label: 'End date',
						class: 'ion-no-margin',
						value: '',
						displayFormat: 'DD/MMM/YYYY HH:mm',
						dependedParent: 'startDate',
						type: 'date',
						position: 'floating',
						validators: {
							required: true,
						},
					},
					{
						name: 'recommendedFor',
						label: 'Recommended for',
						class: 'ion-no-margin',
						value: '',
						type: 'chip',
						position: '',
						disabled: false,
						showSelectAll: true,
						showAddOption: true,
						validators: {
							required: true,
						},
						optionsUrl: {
							url: 'roles/search',
							method: 'POST',
						},
						options: [
							{
								value: 'deo',
								label: 'District education officer',
							},
							{
								value: 'beo',
								label: 'Block education officer',
							},
							{
								value: 'hm',
								label: 'Head master',
							},
							{
								value: 'TE',
								label: 'Teacher',
							},
							{
								value: 'CO',
								label: 'Cluster officials',
							},
						],
					},
					{
						name: 'categories',
						label: 'Categories',
						class: 'ion-no-margin',
						value: '',
						type: 'chip',
						position: '',
						disabled: false,
						showSelectAll: true,
						showAddOption: true,
						validators: {
							required: true,
						},
						options: [
							{
								value: 'Educational leadership',
								label: 'Educational leadership',
							},
							{
								value: 'School process',
								label: 'School process',
							},
							{
								value: 'Communication',
								label: 'Communication',
							},
							{
								value: 'SQAA',
								label: 'SQAA',
							},
							{
								value: 'Professional development',
								label: 'Professional development',
							},
						],
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
						showSelectAll: true,
						showAddOption: true,
						validators: {
							required: true,
						},
						options: [
							{
								label: 'English',
								value: '1',
							},
							{
								label: 'Hindi',
								value: '2',
							},
						],
					},
				],
			},
		},
	},
	{
		subType: 'createProfile',
		type: 'profile',
		action: 'formFields',
		ver: '4.4',
		data: {
			templateName: 'defaultTemplate',
			fields: {
				controls: [
					{
						name: 'name',
						label: 'Your name',
						value: 'mentor',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						errorLabel: 'Name',
						validators: {
							required: true,
							pattern: '^[a-zA-Z0-9 ]*$',
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
								label: 'Himachal Prdesh',
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
						errorLabel: 'Experience',
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
						errorMessage: "About can't be more than 150 character",
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
						errorLabel: 'Expertise',
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
	},
	{
		subType: 'termsAndConditionsForm',
		type: 'termsAndConditions',
		action: 'termsAndConditionsFields',
		ver: '1.0',
		data: {
			templateName: 'defaultTemplate',
			fields: {
				controls: [
					{
						name: 'termsAndConditions',
						label: "<div class='wrapper'><p>The Terms and Conditions constitute a legally binding agreement made between you and ShikshaLokam, concerning your access to and use of our mobile application MentorED.</p><p>By creating an account, you have read, understood, and agree to the <br /> <a class='links' href='https://shikshalokam.org/mentoring/term-of-use'>Terms of Use</a> and <a class='links' href='https://shikshalokam.org/mentoring/privacy-policy'>Privacy Policy.</p></div>",
						value: "I've read and agree to the User Agreement <br /> and Privacy Policy",
						class: 'ion-margin',
						type: 'html',
						position: 'floating',
						validators: {
							required: true,
							minLength: 10,
						},
					},
				],
			},
		},
	},
	{
		subType: 'faqPage',
		type: 'faq',
		action: 'formFields',
		data: {
			templateName: 'defaultTemplate',
			fields: {
				controls: [
					{
						name: 'faq1',
						label: 'How do I sign-up on MentorED?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'Once you install the application, open the MentorED app.',
							'Click on the ‘Sign-up’ button.',
							'Select the role you want to sign up for and enter the basic information. You will receive an OTP on the registered email ID.',
							'Enter the OTP & click on verify.',
						],
					},
					{
						name: 'faq2',
						label: 'What to do if I forget my password?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'On the login page, click on the ‘Forgot Password’ button.',
							'Enter your email ID and the new password.',
							'Click on the Reset password button.',
							'You will receive an OTP on the registered email ID.',
							'Once you enter the correct OTP, you will be able to login with the new password.',
						],
					},
					{
						name: 'faq3',
						label: 'How do I complete my profile?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'On the homepage, in the bottom navigation bar click on the Profile icon to reach the Profile page.',
							'Click on the ‘Edit’ button to fill in or update your details.',
							'Click on the Submit button to save all your changes.',
						],
					},
					{
						name: 'faq4',
						label: 'How do I create a session?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'On the home page select the ‘Created by me’ section.',
							'Click on the ‘Create New session’ or + icon on the top to create a new session.',
							'Enter all the profile details.',
							'Click on publish to make your session active for Mentees to enroll.',
						],
					},
					{
						name: 'faq5',
						label: 'How do I enroll for a session?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'On home page, you will see the upcoming sessions. ',
							'Click on View More to view all the sessions available. ',
							'Click on the enroll button to get details about the session. ',
							'Click on the Enroll button on the bottom bar to register for the session.',
						],
					},
					{
						name: 'faq6',
						label: 'How do I find Mentors on MentorED?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'On the homepage click on the Mentor icon on the bottom navigation bar to see the list of Mentors available on the platform. From the list, you can click on the Mentor tab to learn more about them.',
						],
					},
					{
						name: 'faq7',
						label: 'Cancel / Enroll for a session',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'From the My sessions tab on the homepage and click on the session you want to unregister from. Click on the cancel button at the bottom from the session page to cancel your enrollment.',
						],
					},
					{
						name: 'faq8',
						label: 'How do I attend a session?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'Click on the session you want to attend from the My sessions tab.',
							'Click on the Join button to attend the session.',
						],
					},
					{
						name: 'faq9',
						label: 'What will I be able to see on the Dashboard tab?',
						value: '',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'As a Mentor, you will be able to see the number of sessions that you have created on MentorED and the number of sessions you have actually hosted on the platform.',
							'As a Mentee, you will be able to see the total number of sessions you have registered for and the total number of sessions you have attended among them.',
						],
					},
				],
			},
		},
	},
	{
		subType: 'videos',
		type: 'helpVideos',
		action: 'videoFields',
		data: {
			templateName: 'defaultTemplate',
			fields: {
				controls: [
					{
						name: 'helpVideo1',
						label: 'How to sign up?',
						value: 'https://youtu.be/_QOu33z4LII',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ',
						],
					},
					{
						name: 'helpVideo2',
						label: 'How to set up a profile?',
						value: 'https://youtu.be/_QOu33z4LII',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ',
						],
					},
					{
						name: 'helpVideo3',
						label: 'How to enroll a session?',
						value: 'https://youtu.be/_QOu33z4LII',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ',
						],
					},
					{
						name: 'helpVideo4',
						label: 'How to join a session?',
						value: 'https://youtu.be/_QOu33z4LII',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ',
						],
					},
					{
						name: 'helpVideo5',
						label: 'How to start creating sessions?',
						value: 'https://youtu.be/_QOu33z4LII',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ',
						],
					},
					{
						name: 'helpVideo6',
						label: 'How to search for mentors?',
						value: 'https://youtu.be/_QOu33z4LII',
						class: 'ion-no-margin',
						type: 'text',
						position: 'floating',
						validators: {
							required: true,
						},
						options: [
							'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ',
						],
					},
				],
			},
		},
	},
]
var moment = require('moment')

module.exports = {
	async up(db) {
		try {
			global.migrationMsg = 'Uploaded email templates'
			let formData = []
			data.forEach(async function (mappedData) {
				mappedData['updatedAt'] = moment().format()
				mappedData['createdAt'] = moment().format()
				mappedData['createdBy'] = 'SYSTEM'
				mappedData['updatedBy'] = 'SYSTEM'
				formData.push(mappedData)
			})
			await db.collection('forms').insertMany(formData)
		} catch (error) {
			console.log(error)
		}
	},

	async down(db) {
		try {
			db.collection('forms').deleteMany({
				type: { $in: data.map((mappedData) => mappedData.type) },
			})
		} catch (error) {
			console.error(error)
		}
	},
}
