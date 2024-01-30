'use strict'
exports.eventBodyDTO = ({ entity, eventType, entityId, changedValues = [], args = {} }) => {
	try {
		if (!entity || !eventType || !entityId)
			throw new Error('Entity, EventType & EntityId values are mandatory for an Event')
		const allowedArgs = ['created_at', 'created_by', 'updated_at', 'updated_by']
		const disallowedArgs = Object.keys(args).filter((arg) => !allowedArgs.includes(arg))
		if (disallowedArgs.length > 0)
			throw new Error(`Event Args contain disallowed keys: ${disallowedArgs.join(', ')}`)
		const changes = changedValues.reduce((result, obj) => {
			const { fieldName, oldValue, newValue } = obj
			if (!result[fieldName]) result[fieldName] = {}
			if (oldValue) result[fieldName].oldValue = oldValue
			if (newValue) result[fieldName].newValue = newValue
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
		console.error(error)
		return false
	}
}
