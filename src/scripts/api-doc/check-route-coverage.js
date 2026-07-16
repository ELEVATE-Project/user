/**
 * Compares the live route table produced by route-inventory.js against the
 * bundled api-doc.yaml's `paths` and fails if a live route has no
 * corresponding documented path.
 *
 * This app dispatches almost everything through one dynamic Express route
 * (src/routes/index.js: `/user/:version/:controller/:method[/:id]`, plus a
 * `:file` variant), so app._router.stack can only ever report those
 * generic templates, not the hundreds of concrete `/user/v1/<domain>/<op>`
 * endpoints the templates actually resolve to at runtime. Per-segment
 * comparison against api-doc.yaml's paths is therefore done structurally
 * (Express `:param` / OpenAPI `{param}` segments both treated as
 * wildcards, literal segments compared as-is) rather than by exact string
 * match. A handful of routes are mounted directly on `app` outside that
 * dynamic router (e.g. /health) and are exposed to API consumers through a
 * gateway that adds a `/user` prefix Express itself never sees (see
 * src/constants/interface-routes/configs.json), so those are also checked
 * with a `/user` prefix before being called uncovered.
 *
 * Anything still uncovered after that is compared against
 * route-coverage-baseline.json, a fixed list of pre-existing gaps, so this
 * check only fails on newly introduced ones.
 *
 * Usage: node scripts/api-doc/check-route-coverage.js
 */

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const ROUTE_INVENTORY_FILE = path.join(__dirname, 'route-inventory.json')
const BASELINE_FILE = path.join(__dirname, 'route-coverage-baseline.json')
const API_DOC_FILE = path.resolve(__dirname, '../../api-doc/api-doc.yaml')

function segments(routePath) {
	return routePath.split('/').filter(Boolean)
}

function isWildcardSegment(segment) {
	return segment.startsWith(':') || (segment.startsWith('{') && segment.endsWith('}'))
}

function segmentsMatch(routeSegments, docSegments) {
	if (routeSegments.length !== docSegments.length) return false
	return routeSegments.every((seg, i) => {
		const docSeg = docSegments[i]
		if (isWildcardSegment(seg) || isWildcardSegment(docSeg)) return true
		return seg === docSeg
	})
}

function isCovered(routePath, docPaths, docSegmentsByPath) {
	if (docPaths.includes(routePath) || docPaths.includes('/user' + routePath)) return true

	const routeSegs = segments(routePath)
	const prefixedRouteSegs = segments('/user' + routePath)
	return docSegmentsByPath.some(
		(docSegs) => segmentsMatch(routeSegs, docSegs) || segmentsMatch(prefixedRouteSegs, docSegs)
	)
}

function main() {
	if (!fs.existsSync(ROUTE_INVENTORY_FILE)) {
		console.error(`Missing ${ROUTE_INVENTORY_FILE} — run route-inventory.js first.`)
		process.exit(1)
	}

	const inventory = JSON.parse(fs.readFileSync(ROUTE_INVENTORY_FILE, 'utf8'))
	if (inventory.bootError) {
		console.error(`route-inventory.json recorded a boot error: ${inventory.bootError}`)
		process.exit(1)
	}

	const apiDoc = yaml.load(fs.readFileSync(API_DOC_FILE, 'utf8'))
	const docPaths = Object.keys(apiDoc.paths || {})
	const docSegmentsByPath = docPaths.map(segments)

	// '*' entries come from a catch-all router.all('*', ...) 404 handler, not a real endpoint.
	const routePaths = [...new Set(inventory.routes.map((r) => r.path).filter((p) => p && p !== '*'))]

	const uncovered = routePaths.filter((p) => !isCovered(p, docPaths, docSegmentsByPath))

	const baseline = fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : []
	const newlyUncovered = uncovered.filter((p) => !baseline.includes(p))
	const staleBaselineEntries = baseline.filter((p) => !uncovered.includes(p))

	if (staleBaselineEntries.length > 0) {
		console.warn(
			`Note: ${staleBaselineEntries.length} route-coverage-baseline.json entr${
				staleBaselineEntries.length === 1 ? 'y is' : 'ies are'
			} now documented and can be removed from the baseline:\n` +
				staleBaselineEntries.map((p) => `  - ${p}`).join('\n')
		)
	}

	if (newlyUncovered.length > 0) {
		console.error(
			`${newlyUncovered.length} live route(s) have no corresponding path in api-doc/api-doc.yaml:\n` +
				newlyUncovered.map((p) => `  - ${p}`).join('\n') +
				`\n\nIf this route is genuinely not meant to be public API documentation, add it to ` +
				`${path.relative(process.cwd(), BASELINE_FILE)} instead.`
		)
		process.exit(1)
	}

	console.log(
		`Route coverage OK: ${routePaths.length} live route pattern(s) checked, ${uncovered.length} pre-existing baseline gap(s) suppressed.`
	)
}

main()
