const axios = require('axios')
const fs = require('fs')
const path = require('path')

// 🛠️ CONFIGURABLE
const CONFIG = {
	BASE_URL: 'http://localhost:3001',
	LOGIN_PATH: '/user/v1/account/login',
	ENTITY_CREATE_PATH: '/user/v1/entity-type/create',
	CREDENTIALS: {
		identifier: 'nevil@tunerlabs.com',
		password: 'PASSword###11',
	},
	ENTITY_TYPES_FILE: path.join(__dirname, 'entity-types.json'),
}

async function getAuthToken() {
	const url = `${CONFIG.BASE_URL}${CONFIG.LOGIN_PATH}`
	try {
		const response = await axios.post(url, CONFIG.CREDENTIALS, {
			headers: {
				origin: 'localhost',
				'Content-Type': 'application/json',
			},
		})
		const token = response.data?.result?.access_token
		if (!token) throw new Error('Token not found in login response')
		return token
	} catch (error) {
		console.error('❌ Failed to get auth token:', error.message)
		process.exit(1)
	}
}

async function createEntityType(token, entityType) {
	const url = `${CONFIG.BASE_URL}${CONFIG.ENTITY_CREATE_PATH}`
	try {
		const response = await axios.post(url, entityType, {
			headers: {
				'X-auth-token': `bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})
		console.log(`✅ Created entity: ${entityType.value}`)
	} catch (error) {
		const msg = error.response?.data || error.message
		console.error(`❌ Failed to create ${entityType.value}:`, msg)
	}
}

async function main() {
	const token = await getAuthToken()
	const entityTypes = JSON.parse(fs.readFileSync(CONFIG.ENTITY_TYPES_FILE, 'utf-8'))

	for (const entity of entityTypes) {
		// Ensure required fields exist
		entity.type = entity.type || 'SYSTEM'
		await createEntityType(token, entity)
	}
}

main()
