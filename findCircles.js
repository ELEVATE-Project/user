const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const baseDirectory = './src' // Change this to your base directory

function runCommandForJSFiles(directory) {
	const files = fs.readdirSync(directory)

	files.forEach((file) => {
		const filePath = path.join(directory, file)
		const isDirectory = fs.statSync(filePath).isDirectory()

		if (isDirectory && file !== 'node_modules') {
			runCommandForJSFiles(filePath) // Recursively traverse directories, excluding node_modules
		} else if (!isDirectory && file.endsWith('.js')) {
			// Run the specified command for JavaScript files
			const command = `dpdm ${filePath} --tsconfig ./src/jsconfig.json -o test.json --no-warning --no-tree`

			try {
				console.log(`Running command for ${filePath}`)
				execSync(command, { stdio: 'inherit' })
			} catch (error) {
				console.error(`Error running command for ${filePath}: ${error.message}`)
			}
		}
	})
}

runCommandForJSFiles(baseDirectory)
