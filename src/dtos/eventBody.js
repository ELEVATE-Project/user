'use strict'

/**
 * Creates an event body DTO with validated fields
 * @param {Object} params - The parameters object
 * @param {string} params.entity - The entity name
 * @param {string} params.eventType - The type of event
 * @param {string|number} params.entityId - The entity identifier
 * @param {Array<{fieldName: string, oldValue?: any, newValue?: any}>} params.changedValues - Array of changed fields
 * @param {Object} params.args - Additional arguments
 * @returns {Object|false} The formatted event body or false if validation fails
 */
exports.eventBodyDTO = ({ entity, eventType, entityId, changedValues = [], args = {} }) => {
    try {
        // Validate required fields
        if (!entity || typeof entity !== 'string') throw new Error('Entity must be a valid string')
        if (!eventType || typeof eventType !== 'string') throw new Error('EventType must be a valid string')
        if (!entityId) throw new Error('EntityId is required')
        
        // Validate changedValues array structure
        if (!Array.isArray(changedValues)) throw new Error('ChangedValues must be an array')
        changedValues.forEach(change => {
            if (!change.fieldName) throw new Error('Each change must have a fieldName')
        })

        // Validate args
        const allowedArgs = ['created_at', 'created_by', 'updated_at', 'updated_by']
        const disallowedArgs = Object.keys(args).filter(arg => !allowedArgs.includes(arg))
        if (disallowedArgs.length > 0) {
            throw new Error(`Invalid args: ${disallowedArgs.join(', ')}. Allowed: ${allowedArgs.join(', ')}`)
        }

        // Process changes using functional approach
        const changes = changedValues.reduce((result, { fieldName, oldValue, newValue }) => ({
            ...result,
            [fieldName]: {
                ...(oldValue !== undefined && { oldValue }),
                ...(newValue !== undefined && { newValue })
            }
        }), {})

        return {
            entity,
            eventType,
            entityId,
            changes,
            ...args,
        }
    } catch (error) {
        console.error(`EventBodyDTO Error: ${error.message}`)
        return false
    }
}
