module.exports = {
	rootDir: '.',
	roots: ['<rootDir>/'],
	preset: '@shelf/jest-mongodb',
	moduleNameMapper: {
		'@root/(.*)': '<rootDir>/$1',
		'@services/(.*)': '<rootDir>/services/$1',
		'@controllers/(.*)': '<rootDir>/controllers/$1',
		'@database/(.*)': '<rootDir>/database/$1',
		'@generics/(.*)': '<rootDir>/generics/$1',
		'@constants/(.*)': '<rootDir>/constants/$1',
		'@configs/(.*)': '<rootDir>/configs/$1',
		'@health-checks/(.*)': '<rootDir>/health-checks/$1',
	},
}
process.env = Object.assign(process.env, {
	KEY: 'g5MQ7HG/r5gPCPQQCwfBBEduAt72ewJIY/gWc0RNoak=',
	IV: '2lIctRkqzYMWbwlW1jCC9A==',
})
