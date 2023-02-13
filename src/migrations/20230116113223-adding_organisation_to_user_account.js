let _ = require('lodash')

module.exports = {
	async up(db) {
		global.migrationMsg = 'Include collectionName and what does it update'
		let organisationInfo = await db
			.collection('organisations')
			.findOne({ code: process.env.DEFAULT_ORGANISATION_CODE })

		if (!organisationInfo) {
			const organisation = await db.collection('organisations').insertOne({
				code: process.env.DEFAULT_ORGANISATION_CODE,
				name: process.env.DEFAULT_ORGANISATION_CODE,
				description: 'default organisation',
			})

			organisationInfo = {
				_id: organisation.insertedId,
			}
		}

		const users = await db.collection('users').find({}).toArray()

		let chunkUserData = _.chunk(users, 100)

		for (let chunkPointer = 0; chunkPointer < chunkUserData.length; chunkPointer++) {
			let userDoc = chunkUserData[chunkPointer]

			for (let i = 0; i < userDoc.length; i++) {
				let updateObject = {
					organisationId: organisationInfo._id,
				}

				await db.collection('users').findOneAndUpdate({ _id: userDoc[i]._id }, { $set: updateObject })
			}
		}
	},

	async down(db) {
		let updateCollection = await db.collection('users').update({}, { $set: { organisationId: null } })
		// return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
	},
}
