/**
 * name : rollbackStack.js
 * author : Adithya Dinesh
 * created-date : 08-May-2025
 * Description : Stack implementation to store functions to execute in a LIFO order.
 */

class RollbackStack {
	constructor() {
		this.functions = [] // Stack to store rollback functions
	}

	// Push a rollback function onto the stack
	push(rollbackFn) {
		if (typeof rollbackFn !== 'function') {
			throw new Error('Rollback entry must be a function')
		}
		this.functions.push(rollbackFn)
	}

	// Execute all rollback functions in LIFO order
	async execute() {
		while (this.functions.length > 0) {
			const rollbackFn = this.functions.pop() // Pop the last function (LIFO)
			try {
				await rollbackFn() // Execute the async function
			} catch (error) {
				console.error('Error executing rollback function:', error)
				// Continue with remaining functions
			}
		}
	}

	// Get the current size of the stack
	size() {
		return this.functions.length
	}

	// Clear the stack (optional, for cleanup)
	clear() {
		this.functions = []
	}
}

module.exports = RollbackStack
