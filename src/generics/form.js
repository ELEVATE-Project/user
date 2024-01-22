const formQueries = require('../database/queries/form')
async function getAllFormsVersion() {
	try {
		return await formQueries.findAllTypeFormVersion()
	} catch (error) {
		console.error(error)
	}
}
module.exports = { getAllFormsVersion }
