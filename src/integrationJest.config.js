module.exports = {
	rootDir: '.',
	roots: ['<rootDir>/'],
	setupFiles: ['dotenv/config'],
	//globalSetup: './databaseSetup.js',
	//globalTeardown: './databaseTeardown.js',
	setupFilesAfterEnv: ['./setupFileAfterEnv.js'],
	moduleNameMapper: {
		'@root/(.*)': '<rootDir>/$1',
		'@services/(.*)': '<rootDir>/services/$1',
		'@controllers/(.*)': '<rootDir>/controllers/$1',
		'@db/(.*)': '<rootDir>/db/$1',
		'@database/(.*)': '<rootDir>/database/$1',
		'@generics/(.*)': '<rootDir>/generics/$1',
		'@constants/(.*)': '<rootDir>/constants/$1',
		'@configs/(.*)': '<rootDir>/configs/$1',
		'@health-checks/(.*)': '<rootDir>/health-checks/$1',
		'@commonTests': '<rootDir>/integration-tests/commonTests',
	},
	testMatch: ['<rootDir>/integration-tests/**/*.spec.js'],
	reporters: ['default', ['jest-junit', { suiteName: 'jest tests', outputDirectory: '../dev-ops/report' }]],
}
/* Add env variables used by jest here because jest do not have access to app or docker env files.
Make sure the values match with ./dev-ops/integration_test.env */

process.env = Object.assign(process.env, {})
