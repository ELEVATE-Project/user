const formsQueries = require('@database/queries/forms')
const utils = require('@generics/utils')
async function getAllFormsVersion() {
	let form = (await utils.internalGet('formVersion')) || false
	if (!form) {
		form = await formsQueries.findAllTypeFormVersion()
		await utils.internalSet('formVersion', form)
	}
	return form
}
module.exports = { getAllFormsVersion }
