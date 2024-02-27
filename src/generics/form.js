const formsQueries = require('@database/queries/form')

//const utils = require('@generics/utils')
async function getAllFormsVersion() {
	/* let form = (await utils.internalGet('formVersion')) || false
	if (!form) {
		form = await formsQueries.findAllTypeFormVersion()
		await utils.internalSet('formVersion', form)
	}
	return form */

	return await formsQueries.findAllTypeFormVersion()
}
module.exports = { getAllFormsVersion }
