const formQueries = require('../database/queries/form')
const utils = require('@generics/utils')
async function getAllFormsVersion() {
	let form = (await utils.internalGet('formVersion')) || false
	if (!form) {
		form = await formQueries.findAllTypeFormVersion()
		await utils.internalSet('formVersion', form)
	}
	return form
}
module.exports = { getAllFormsVersion }
