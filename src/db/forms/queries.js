/**
 * name : models/forms/query
 * author : Aman karki
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

const utils = require('@generics/utils')
const Forms = require('./model')

module.exports = class FormsData {
	static createForm(data) {
		return new Promise(async (resolve, reject) => {
			try {
				await new Forms(data).save()
				resolve(true)
			} catch (error) {
				reject(error)
			}
		})
	}

	static findOneForm(type) {
		const filter = { type }
		const projection = {}
		return new Promise(async (resolve, reject) => {
			try {
				const formData = await Forms.findOne(filter, projection)
				resolve(formData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static findAllTypeFormVersion() {
		const projection = {
			type: 1,
			ver: 1,
		}
		return new Promise(async (resolve, reject) => {
			try {
				const formData = await Forms.find({}, projection)
				let versions = {}
				formData.forEach((version) => {
					versions[version.type] = version.ver
				})
				resolve(versions)
			} catch (error) {
				reject(error)
			}
		})
	}

	static updateOneForm(update, options = {}) {
		const filter = {
			type: update.type,
			subType: update.subType,
			action: update.action,
			'data.templateName': update.data.templateName,
		}
		return new Promise(async (resolve, reject) => {
			try {
				const res = await Forms.updateOne(filter, update, options)
				if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
					resolve('ENTITY_UPDATED')
				} else if (
					(res.n === 1 && res.nModified === 0) ||
					(res.matchedCount === 1 && res.modifiedCount === 0)
				) {
					resolve('ENTITY_ALREADY_EXISTS')
				} else {
					resolve('ENTITY_NOT_FOUND')
				}
			} catch (error) {
				reject(error)
			}
		})
	}

	static async checkVersion(bodyData) {
		try {
			const filter = { type: bodyData.type }
			const projection = { type: 1, ver: 1 }
			const formData = await Forms.findOne(filter, projection)
			return utils.compareVersion(formData.ver, bodyData.ver)
		} catch (err) {
			return err
		}
	}
}
