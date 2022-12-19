const formsData = require('@db/forms/queries')
const utils = require('@generics/utils')
async function getAllFormsVersion() {
	let form = (await utils.internalGet('formVersion')) || false
	if (!form) {
		form = await formsData.findAllTypeFormVersion()
		await utils.internalSet('formVersion', form)
	}
	return form
}
module.exports = { getAllFormsVersion }
