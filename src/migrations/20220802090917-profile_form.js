module.exports = {
	async up(db) {
		global.migrationMsg = 'Profile Form Created'

		const form = await db.collection('forms').findOne({ type: 'profile' })
		if (!form) {
			const controls = [
				{
					name: 'name',
					label: 'Your name',
					value: 'mentor',

					type: 'text',

					errorLabel: 'Name',
					validators: { required: true, pattern: '^[a-zA-Z0-9 ]*$' },
					options: [],
				},
				{
					name: 'location',
					label: 'Select your Location',
					value: [{ value: 'AP', label: 'Andhra Pradesh' }],

					type: 'select',

					errorLabel: 'Location',
					validators: { required: true },
					options: [
						{ value: 'AP', label: 'Andhra Pradesh' },
						{ value: 'AR', label: 'Arunachal Pradesh' },
						{ value: 'As', label: 'Assam' },
						{ value: 'BR', label: 'Bihar' },
						{ value: 'CG', label: 'Chhattisgarh' },
						{ value: 'GA', label: 'Goa' },
						{ value: 'GJ', label: 'Gujarat' },
						{ value: 'HR', label: 'Haryana' },
						{ value: 'HP', label: 'Himachal Prdesh' },
						{ value: 'JH', label: 'Jharkhand' },
						{ value: 'KN', label: 'Karnataka' },
						{ value: 'KL', label: 'Kerala' },
						{ value: 'MP', label: 'Madhya Pradesh' },
						{ value: 'MH', label: 'Maharashtra' },
						{ value: 'MN', label: 'Manipur' },
						{ value: 'ML', label: 'Meghalaya' },
						{ value: 'MZ', label: 'Mizoram' },
						{ value: 'NL', label: 'Nagaland' },
						{ value: 'OD', label: 'Odisha' },
						{ value: 'PB', label: 'Punjab' },
						{ value: 'RJ', label: 'Rajasthan' },
						{ value: 'SK', label: 'Sikkim' },
						{ value: 'TN', label: 'Tamil Nadu' },
						{ value: 'TS', label: 'Telangana' },
						{ value: 'TR', label: 'Tripura' },
						{ value: 'UP', label: 'Uttar Pradesh' },
						{ value: 'UK', label: 'Uttarakhand' },
						{ value: 'WB', label: 'West Bengal' },
					],
				},
				{
					name: 'designation',
					label: 'Your role',

					value: [
						{ value: 'teacher', label: 'Teacher' },
						{ value: 'HM', label: 'Head Master' },
					],
					type: 'chip',

					disabled: false,
					showSelectAll: true,
					errorLabel: 'Designation',
					validators: { required: true },
					showAddOption: true,
					options: [
						{ value: 'teacher', label: 'Teacher' },
						{ value: 'HM', label: 'Head Master' },
						{ value: 'BEO', label: 'Block Education Officer' },
						{ value: 'DEO', label: 'District Education Officer' },
					],
				},
				{
					name: 'experience',
					label: 'Your Experience in years',
					value: '10',

					type: 'number',

					errorLabel: 'Experience',
					validators: { required: true, maxLength: 2 },
					options: [],
				},
				{
					name: 'about',
					label: 'Tell us About yourself',
					value: 'mentor',

					type: 'textarea',

					errorMessage: "About can't be more than 150 words",
					validators: { required: true, maxLength: 150 },
					options: [],
				},
				{
					name: 'areasOfExpertise',
					label: 'Your Expertise',

					value: [{ value: 'eduLdship', label: 'Educational Leadership' }],
					type: 'chip',

					disabled: false,
					showSelectAll: true,
					errorLabel: 'Expertise',
					validators: { required: true },
					showAddOption: true,
					options: [
						{ value: 'eduLdship', label: 'Educational Leadership' },
						{ value: 'schoolProcess', label: 'School Process' },
					],
				},
				{
					name: 'educationQualification',
					label: 'Education qualification',
					value: 'mentor',

					type: 'text',

					errorLabel: 'Education qualification',
					validators: { required: true },
					options: [],
				},
				{
					name: 'languages',
					label: 'Languages',

					value: [{ value: 'english', label: 'English' }],
					type: 'chip',

					disabled: false,
					showSelectAll: true,
					errorLabel: 'Expertise',
					validators: { required: true },
					showAddOption: true,
					options: [
						{ value: 'english', label: 'English' },
						{ value: 'hindi', label: 'Hindi' },
					],
				},
			]
			const nullPosition = ['designation', 'areasOfExpertise', 'languages']
			controls.forEach((element) => {
				if (nullPosition.includes(element.name)) {
					element.position = ''
				} else {
					element.position = 'floating'
				}
				element.class = 'ion-margin'
			})

			let formsData = {
				type: 'profile',
				subType: 'createProfile',
				action: 'formFields',
				__v: 0,
				data: {
					templateName: 'defaultTemplate',
					fields: {
						controls: controls,
					},
				},
			}
			await db.collection('forms').insertOne(formsData)
		}
	},

	async down(db) {
		const form = await db.collection('forms').findOne({ type: 'profile' })
		if (form) {
			await db.collection('forms').deleteOne({ type: 'profile' })
		}
	},
}
