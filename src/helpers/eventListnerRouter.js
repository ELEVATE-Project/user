'use strict'

exports.eventListenerRouter = async (eventBody, { createFn = null, updateFn = null, deleteFn = null }) => {
	try {
		switch (eventBody.eventType) {
			case 'create':
				validateFunction(createFn, 'create')
				return await createFn(eventBody)
			case 'update':
				validateFunction(updateFn, 'update')
				return await updateFn(eventBody)
			case 'delete':
				validateFunction(deleteFn, 'delete')
				return await deleteFn(eventBody)
			default:
				throw new Error(`Invalid EventType: ${eventBody.eventType}`)
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}

const validateFunction = (fn, eventType) => {
	if (!fn) throw new Error(`Handler Function Not Defined For EventType: "${eventType}"`)
	else if (typeof fn !== 'function')
		throw new Error(`Expected a function for EventType "${eventType}", found: ${typeof fn}`)
}
