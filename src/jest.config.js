module.exports = {
	rootDir: '.',
	roots: ['<rootDir>/'],
	preset: '@shelf/jest-mongodb',
	moduleNameMapper: {
		'@root/(.*)': '<rootDir>/$1',
		'@services/(.*)': '<rootDir>/services/$1',
		'@controllers/(.*)': '<rootDir>/controllers/$1',
		'@db/(.*)': '<rootDir>/db/$1',
		'@generics/(.*)': '<rootDir>/generics/$1',
		'@constants/(.*)': '<rootDir>/constants/$1',
		'@configs/(.*)': '<rootDir>/configs/$1',
		'@health-checks/(.*)': '<rootDir>/health-checks/$1',
	},
}
