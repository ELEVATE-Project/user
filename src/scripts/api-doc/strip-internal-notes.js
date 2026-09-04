/**
 * Strips `x-internal-note` vendor-extension lines from the bundled
 * api-doc.yaml before it ships. These are internal engineering annotations
 * (file paths, code-branch rationale, gap pointers) meant for the
 * per-domain source files (paths/*.yaml, components/*.yaml) as an audit
 * record — they should never reach api-doc/index.html or API consumers,
 * since that's the file app.js actually serves.
 *
 * Every x-internal-note value in this repo is a single-line scalar (no
 * YAML block-scalar `|`/`>` usage), so a line-level removal is safe and
 * avoids the reformatting risk of a full parse+re-dump round-trip.
 *
 * Usage: node scripts/api-doc/strip-internal-notes.js
 */

const fs = require('fs')
const path = require('path')

const API_DOC_FILE = path.resolve(__dirname, '../../api-doc/api-doc.yaml')

function main() {
	const original = fs.readFileSync(API_DOC_FILE, 'utf8')
	const lines = original.split('\n')
	const stripped = lines.filter((line) => !/^\s*x-internal-note:/.test(line))
	const removedCount = lines.length - stripped.length

	if (removedCount === 0) {
		console.log('strip-internal-notes: no x-internal-note lines found, nothing to do.')
		return
	}

	fs.writeFileSync(API_DOC_FILE, stripped.join('\n'))
	console.log(
		`strip-internal-notes: removed ${removedCount} x-internal-note line(s) from ${path.relative(
			process.cwd(),
			API_DOC_FILE
		)}.`
	)
}

main()
