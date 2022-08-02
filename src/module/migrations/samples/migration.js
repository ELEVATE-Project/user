module.exports = {
	async up(db) {
		global.migrationMsg = 'Include collectionName and what does it update'
		// return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
	},

	async down(db) {
		// return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
	},
}
