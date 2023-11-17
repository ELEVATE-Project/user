const { Client } = require('pg')
const { matchers } = require('jest-json-schema')
const { Pool } = require('pg')
const pool = new Pool()

expect.extend(matchers)

//PostgreSQL connection string
const connectionString = 'postgres://postgres:postgres@localhost:5432/user-local'

// Connect to the PostgreSQL database using the connection string
const db = new Client({
	connectionString: connectionString,
})

db.connect((err) => {
	if (err) {
		console.error('Database connection error:', err)
	} else {
		console.log('Connected to DB')
	}
})

global.db = db

beforeAll(async () => {})

afterAll(async () => {
	try {
		// Add any cleanup code you need, such as dropping tables, here
	} catch (error) {
		console.error(error)
	} finally {
		db.end() // Close the PostgreSQL connection
	}
})
