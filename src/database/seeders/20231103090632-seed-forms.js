module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
			if (!defaultOrgId) {
				throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
			}
			const formData = [
				{
					type: 'editProfile',
					sub_type: 'editProfileForm',
					data: JSON.stringify({
						fields: {
							controls: [
								{
									name: 'name',
									label: 'Your name',
									value: '',
									class: 'ion-no-margin',
									type: 'text',
									position: 'floating',
									placeHolder: 'Please enter your full name',
									errorMessage: {
										required: 'Enter your name',
										pattern: 'This field can only contain alphabets',
									},
									validators: { required: true, pattern: '^[^0-9!@#%$&()\\-`.+,/"]*$' },
									options: [],
									meta: { showValidationError: true },
								},
								{
									name: 'location',
									label: 'Select your location',
									value: [],
									class: 'ion-no-margin',
									type: 'select',
									position: 'floating',
									multiple: false,
									errorMessage: { required: 'Please select your location' },
									validators: { required: true },
									options: [],
									meta: { entityType: 'location', errorLabel: 'Location' },
								},
								{
									name: 'designation',
									label: 'Your role',
									class: 'ion-no-margin',
									value: [{}],
									type: 'chip',
									position: '',
									disabled: false,
									multiple: true,
									errorMessage: { required: 'Enter your role' },
									validators: { required: true },
									options: [],
									meta: {
										entityType: 'designation',
										addNewPopupHeader: 'Add a new role',
										showSelectAll: true,
										showAddOption: true,
										errorLabel: 'Designation',
									},
								},
								{
									name: 'experience',
									label: 'Your experience in years',
									value: '',
									class: 'ion-no-margin',
									type: 'text',
									position: 'floating',
									placeHolder: 'Ex. 5 years',
									errorMessage: { required: 'Enter your experience in years' },
									isNumberOnly: true,
									validators: { required: true, maxLength: 2 },
									options: [],
								},
								{
									name: 'about',
									label: 'Tell us about yourself',
									value: '',
									class: 'ion-no-margin',
									type: 'textarea',
									position: 'floating',
									errorMessage: { required: 'This field cannot be empty' },
									placeHolder: 'Please use only 150 character',
									validators: { required: true, maxLength: 150 },
									options: [],
								},
								{
									name: 'area_of_expertise',
									label: 'Your expertise',
									class: 'ion-no-margin',
									value: [],
									type: 'chip',
									position: '',
									disabled: false,
									multiple: true,
									errorMessage: { required: 'Enter your expertise' },
									validators: { required: true },
									options: [],
									meta: {
										entityType: 'area_of_expertise',
										addNewPopupHeader: 'Add your expertise',
										showSelectAll: true,
										showAddOption: true,
										errorLabel: 'Expertise',
									},
								},
								{
									name: 'education_qualification',
									label: 'Education qualification',
									value: '',
									class: 'ion-no-margin',
									type: 'text',
									position: 'floating',
									errorMessage: { required: 'Enter education qualification' },
									placeHolder: 'Ex. BA, B.ED',
									validators: { required: true },
									options: [],
									meta: { errorLabel: 'Education qualification' },
								},
								{
									name: 'languages',
									label: 'Languages',
									class: 'ion-no-margin',
									value: [],
									type: 'chip',
									position: '',
									disabled: false,
									multiple: true,
									errorMessage: { required: 'Enter language' },
									validators: { required: true },
									options: [],
									meta: {
										entityType: 'languages',
										addNewPopupHeader: 'Add new language',
										showSelectAll: true,
										showAddOption: true,
										errorLabel: 'Medium',
									},
								},
							],
						},
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'session',
					sub_type: 'sessionForm',
					data: JSON.stringify({
						template_name: 'defaultTemplate',
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
									errorMessage: { required: 'Enter session title' },
									validators: { required: true },
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
									value: '',
									displayFormat: 'DD/MMM/YYYY HH:mm',
									dependedParent: 'start_date',
									type: 'date',
									placeHolder: 'YYYY-MM-DD hh:mm',
									position: 'floating',
									errorMessage: { required: 'Enter end date' },
									validators: { required: true },
								},
								{
									name: 'recommended_for',
									label: 'Recommended for',
									multiple: true,
									class: 'ion-no-margin',
									value: '',
									type: 'chip',
									position: '',
									disabled: false,
									errorMessage: { required: 'Enter recommended for' },
									validators: { required: true },
									options: [],
									meta: {
										entityType: 'recommended_for',
										addNewPopupHeader: 'Recommended for',
										addNewPopupSubHeader: 'Who is this session for?',
										showSelectAll: true,
										showAddOption: true,
									},
								},
								{
									name: 'categories',
									label: 'Categories',
									multiple: true,
									class: 'ion-no-margin',
									value: '',
									type: 'chip',
									position: '',
									disabled: false,
									errorMessage: { required: 'Enter categories' },
									validators: { required: true },
									options: [],
									meta: {
										entityType: 'categories',
										addNewPopupHeader: 'Add a new category',
										showSelectAll: true,
										showAddOption: true,
									},
								},
								{
									name: 'medium',
									multiple: true,
									label: 'Select medium',
									alertLabel: 'medium',
									class: 'ion-no-margin',
									value: '',
									type: 'chip',
									position: '',
									disabled: false,
									errorMessage: { required: 'Enter select medium' },
									validators: { required: true },
									options: [],
									meta: {
										entityType: 'medium',
										addNewPopupHeader: 'Add new language',
										showSelectAll: true,
										showAddOption: true,
									},
								},
							],
						},
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'termsAndConditions',
					sub_type: 'termsAndConditionsForm',
					data: JSON.stringify({
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
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'faq',
					sub_type: 'faqPage',
					data: JSON.stringify({
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
										'On home page, you will see the upcoming sessions.',
										'Click on View More to view all the sessions available.',
										'Click on the enroll button to get details about the session.',
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
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'helpVideos',
					sub_type: 'videos',
					data: JSON.stringify({
						template_name: 'defaultTemplate',
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
										'https://fastly.picsum.photos/id/0/1920/1280.jpg?hmac=X3VbWxuAM2c1e21LhbXLKKyb-YGilwmraxFBBAjPrrY',
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
										'https://fastly.picsum.photos/id/0/1920/1280.jpg?hmac=X3VbWxuAM2c1e21LhbXLKKyb-YGilwmraxFBBAjPrrY',
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
										'https://fastly.picsum.photos/id/0/1920/1280.jpg?hmac=X3VbWxuAM2c1e21LhbXLKKyb-YGilwmraxFBBAjPrrY',
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
										'https://fastly.picsum.photos/id/0/1920/1280.jpg?hmac=X3VbWxuAM2c1e21LhbXLKKyb-YGilwmraxFBBAjPrrY',
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
										'https://fastly.picsum.photos/id/0/1920/1280.jpg?hmac=X3VbWxuAM2c1e21LhbXLKKyb-YGilwmraxFBBAjPrrY',
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
										'https://fastly.picsum.photos/id/0/1920/1280.jpg?hmac=X3VbWxuAM2c1e21LhbXLKKyb-YGilwmraxFBBAjPrrY',
									],
								},
							],
						},
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'platformApp',
					sub_type: 'platformAppForm',
					data: JSON.stringify({
						template_name: 'defaultTemplate',
						fields: {
							forms: [
								{
									name: 'Google meet',
									hint: 'To use google meet for your meeting, schedule a meeting on google meet and add meeting link below.',
									value: 'Gmeet',
									form: {
										controls: [
											{
												name: 'link',
												label: 'Meet link',
												value: '',
												type: 'text',
												platformPlaceHolder: 'Eg: https://meet.google.com/xxx-xxxx-xxx',
												errorMessage: {
													required: 'Please provide a meet link',
													pattern: 'Please provide a valid meet link',
												},
												validators: {
													required: true,
													pattern: '^https://meet.google.com/[a-z0-9-]+$',
												},
											},
										],
									},
								},
								{
									name: 'Zoom',
									hint: 'To use zoom for your meeting, schedule a meeting on zoom and add meeting details below.',
									value: 'Zoom',
									form: {
										controls: [
											{
												name: 'link',
												label: 'Zoom link',
												value: '',
												class: 'ion-no-margin',
												type: 'text',
												platformPlaceHolder: 'Eg: https://us05web.zoom.us/j/xxxxxxxxxx',
												position: 'floating',
												errorMessage: {
													required: 'Please provide a meeting link',
													pattern: 'Please provide a valid meeting link',
												},
												validators: {
													required: true,
													pattern:
														'^https?://(?:[a-z0-9-.]+)?zoom.(?:us|com.cn)/(?:j|my)/[0-9a-zA-Z?=.]+$',
												},
											},
											{
												name: 'meetingId',
												label: 'Meeting ID',
												value: '',
												class: 'ion-no-margin',
												type: 'number',
												platformPlaceHolder: 'Eg: 123 456 7890',
												position: 'floating',
												errorMessage: {
													required: 'Please provide a meeting ID',
												},
												validators: {
													required: true,
													maxLength: 11,
												},
											},
											{
												name: 'password',
												label: 'Passcode',
												value: '',
												type: 'text',
												platformPlaceHolder: 'Eg: aBc1de',
												errorMessage: {
													required: 'Please provide a valid passcode',
												},
												validators: {
													required: true,
												},
											},
										],
									},
								},
								{
									name: 'WhatsApp',
									hint: 'To use whatsapp for your meeting(32 people or less, create a call link on WhatsApp and add a link below.)',
									value: 'Whatsapp',
									form: {
										controls: [
											{
												name: 'link',
												label: 'WhatsApp',
												value: '',
												type: 'text',
												platformPlaceHolder: 'Eg: https://call.whatsapp.com/voice/xxxxxxxxxxxx',
												errorMessage: {
													required: 'Please provide a WhatsApp link.',
													pattern: 'Please provide a valid WhatsApp link.',
												},
												validators: {
													required: true,
													pattern:
														'^https?://(?:[a-z0-9-.]+)?whatsapp.com/[voicedeo]+/[0-9a-zA-Z?=./]+$',
												},
											},
										],
									},
								},
							],
						},
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'helpApp',
					sub_type: 'helpAppForm',
					data: JSON.stringify({
						template_name: 'defaultTemplate',
						fields: {
							forms: [
								{
									name: 'Report an issue',
									value: 'Report an issue',
									buttonText: 'SUBMIT',
									form: {
										controls: [
											{
												name: 'description',
												label: 'Report an issue',
												value: '',
												class: 'ion-margin',
												position: 'floating',
												platformPlaceHolder: 'Tell us more about the problem you faced',
												errorMessage: {
													required: 'Enter the issue',
												},
												type: 'textarea',
												validators: {
													required: true,
												},
											},
										],
									},
								},
								{
									name: 'Request to delete my account',
									menteeMessage:
										'Please note the following points<ul><li>Account deletion takes 2 days to process. You will receive an email notification when complete.</li><li>Your previous session data will be retained.</li><li>You will be un-enrolled from enrolled sessions.</li></ul>',
									menterMessage:
										'Please note the following points<ul><li>Account deletion takes 2 days to process. You will receive an email notification when complete.</li><li>Your previous session data will be retained.</li><li>Sessions created by you will be deleted.</li><li>You will be un-enrolled from enrolled sessions.</li></ul>',
									value: 'Request to delete my account',
									buttonText: 'DELETE_ACCOUNT',
									form: {
										controls: [
											{
												name: 'description',
												label: 'Reason for deleting account',
												value: '',
												class: 'ion-margin',
												position: 'floating',
												platformPlaceHolder: 'Reason for deleting account',
												errorMessage: '',
												type: 'textarea',
												validators: {
													required: false,
												},
											},
										],
									},
								},
							],
						},
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'sampleCsvDownload',
					sub_type: 'sampleCsvDownload',
					data: JSON.stringify({
						fields: {
							controls: [
								{
									csvDownloadUrl:
										'https://drive.google.com/file/d/1ZDjsc7YLZKIwxmao-8PdEvnHppkMkXIE/view?usp=sharing',
								},
							],
						},
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
				{
					type: 'mentorQuestionnaire',
					sub_type: 'mentorQuestionnaireForm',
					data: JSON.stringify({
						fields: {
							controls: [
								{
									name: 'designation',
									label: 'Your role',
									class: 'ion-no-margin',
									value: [{}],
									type: 'chip',
									position: '',
									disabled: false,
									errorMessage: {
										required: 'Enter your role',
									},
									validators: {
										required: true,
									},
									options: [],
									meta: {
										entityType: 'designation',
										addNewPopupHeader: 'Add a new role',
										showSelectAll: true,
										showAddOption: true,
										errorLabel: 'Designation',
									},
								},
								{
									name: 'experience',
									label: 'Your experience in years',
									value: '',
									class: 'ion-no-margin',
									type: 'text',
									position: 'floating',
									placeHolder: 'Ex. 5 years',
									errorMessage: {
										required: 'Enter your experience in years',
									},
									isNumberOnly: true,
									validators: {
										required: true,
										maxLength: 2,
									},
									options: [],
								},
								{
									name: 'area_of_expertise',
									label: 'Your expertise',
									class: 'ion-no-margin',
									value: [],
									type: 'chip',
									position: '',
									disabled: false,
									errorMessage: {
										required: 'Enter your expertise',
									},
									validators: {
										required: true,
									},
									options: [],
									meta: {
										entityType: 'area_of_expertise',
										addNewPopupHeader: 'Add your expertise',
										showSelectAll: true,
										showAddOption: true,
										errorLabel: 'Expertise',
									},
								},
								{
									name: 'about',
									label: 'Tell us about yourself',
									value: '',
									class: 'ion-no-margin',
									type: 'textarea',
									position: 'floating',
									errorMessage: {
										required: 'This field cannot be empty',
									},
									placeHolder: 'Please use only 150 character',
									validators: {
										required: true,
										maxLength: 150,
									},
									options: [],
								},
							],
						},
					}),
					version: 0,
					organization_id: defaultOrgId,
					updated_at: new Date(),
					created_at: new Date(),
				},
			]
			await queryInterface.bulkInsert('forms', formData, {})
		} catch (error) {
			console.error('Error seeding forms:', error)
		}
	},
	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.bulkDelete('forms', null, {})
		} catch (error) {
			console.error('Error reverting form seeding:', error)
		}
	},
}
