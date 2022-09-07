module.exports = {
	async up(db) {
		global.migrationMsg = 'termsAndConditions Form Created'

		const form = await db.collection('forms').findOne({ type: 'termsAndConditions' })
		if (!form) {
			let formsData = {
				type: 'termsAndConditions',
				subType: 'termsAndConditionsForm',
				action: 'termsAndConditionsFields',
				__v: 0,
				data: {
					templateName: 'defaultTemplate',
					fields: {
						controls: [
							{
								name: 'termsAndConditions',
								label: "<div class='wrapper'><p>The Terms and Conditions constitute a legally binding agreement made between you and Shikshalokam, concerning your access to and use of our mobile application MentorED.</p><p>By creating an account, you have read, understood, and agree to the <br /> <a class='links' href='https://shikshalokam.org/mentoring/term-of-use'>Terms of Use</a> and <a class='links' href='https://shikshalokam.org/mentoring/privacy-policy'>Privacy Policy.</p></div>",
								value: "I've read and agree to the User Agreement <br /> and Privacy Policy",
								class: 'ion-margin',
								type: 'html',
								position: 'floating',
								validators: { required: true, minLength: 10 },
							},
						],
					},
				},
			}
			await db.collection('forms').insertOne(formsData)
		}
	},

	async down(db) {
		const form = await db.collection('forms').findOne({ type: 'termsAndConditions' })
		if (form) {
			await db.collection('forms').deleteOne({ type: 'termsAndConditions' })
		}
	},
}
