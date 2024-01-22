'use strict'
exports.eventBodyDTO = ({ entity, eventType, entityId, changedValues = [], args = {} }) => {
	try {
		if (!entity || !eventType || !entityId)
			throw new Error('Entity, EventType & EntityId values are mandatory for an Event')
		const allowedArgs = process.env.EVENTS_ALLOWED_ARGS.split(',')
		const disallowedArgs = Object.keys(args).filter((arg) => !allowedArgs.includes(arg))
		if (disallowedArgs.length > 0) throw new Error(`Args contain disallowed keys: ${disallowedKeys.join(', ')}`)
		const changes = changedValues.reduce((result, obj) => {
			const { fieldName, oldValue, newValue } = obj
			if (oldValue) result[fieldName][oldValue] = oldValue
			if (newValue) result[fieldName][newValue] = newValue
			return result
		}, {})
		return {
			entity,
			eventType,
			entityId,
			changes,
			...args,
		}
	} catch (error) {
		console.log
		throw error
	}
}
