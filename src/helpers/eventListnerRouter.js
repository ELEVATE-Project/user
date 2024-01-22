'use strict'

exports.eventListenerRouter = async (eventBody, { createFn = null, updateFn = null, deleteFn = null }) => {
	try {
		switch (eventBody.eventType) {
			case process.env.EVENT_TYPE_CREATE:
				validateFunction(createFn, process.env.EVENT_TYPE_CREATE)
				return await createFn(eventBody)
			case process.env.EVENT_TYPE_UPDATE:
				validateFunction(updateFn, process.env.EVENT_TYPE_UPDATE)
				return await updateFn(eventBody)
			case process.env.EVENT_TYPE_DELETE:
				validateFunction(deleteFn, process.env.EVENT_TYPE_DELETE)
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
