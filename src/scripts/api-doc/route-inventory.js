/**
 * Boots the real app (src/app.js) just long enough to read its actual route
 * table off app._router.stack, then exits before it ever listens for traffic.
 *
 * Routes are mounted dynamically by src/routes/index.js (reading
 * src/controllers/** at require time), so there is no single file to grep for
 * "the routes" — this runs the real boot sequence instead of guessing from
 * static analysis. If app.js can't finish booting (DB/Redis/Kafka connection
 * required by src/configs/* or src/generics/materializedViews unreachable),
 * this reports the actual boot error rather than emitting a route list.
 *
 * Must run with cwd = src/ (app.js resolves './.env' and './locales' relative
 * to process.cwd()), e.g. via `docker compose exec user node
 * scripts/api-doc/route-inventory.js`, since KAFKA_URL/REDIS_HOST/
 * DEV_DATABASE_URL in that container point at the docker-network hostnames.
 *
 * Usage: node src/scripts/api-doc/route-inventory.js
 * Output: src/scripts/api-doc/route-inventory.json
 */

const fs = require('fs')
const path = require('path')

const OUTPUT_FILE = path.join(__dirname, 'route-inventory.json')
const APP_FILE = path.resolve(__dirname, '../../app.js')

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'all']

function layerPath(layer) {
	if (layer.route && layer.route.path !== undefined) return layer.route.path
	if (layer.regexp && layer.regexp.fast_star) return '*'
	if (layer.regexp) {
		// best-effort readable form for non-route middleware mount points
		const match = layer.regexp
			.toString()
			.replace(/^\/\^/, '')
			.replace(/\\\/\?\(\?=\\\/\|\$\)\/i?$/, '')
			.replace(/\\\//g, '/')
		return match
	}
	return null
}

function collectRoutes(stack, prefix = '') {
	const routes = []
	for (const layer of stack) {
		if (layer.route) {
			const routePath = prefix + layer.route.path
			const methods = Object.keys(layer.route.methods).filter((m) => layer.route.methods[m])
			for (const method of methods) {
				routes.push({ method: method.toUpperCase(), path: routePath })
			}
		} else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
			routes.push(...collectRoutes(layer.handle.stack, prefix + layerPath(layer)))
		}
	}
	return routes
}

function dumpRoutesAndExit(app) {
	let routes
	let bootError = null
	try {
		routes = collectRoutes(app._router.stack)
	} catch (err) {
		routes = []
		bootError = `Failed to walk app._router.stack: ${err.message}`
	}

	const output = {
		generatedAt: new Date().toISOString(),
		source: 'live boot of src/app.js (app._router.stack), not static analysis',
		routeCount: routes.length,
		routes,
		...(bootError ? { bootError } : {}),
	}

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n')
	console.log(`Wrote ${routes.length} routes to ${OUTPUT_FILE}`)
	process.exit(0)
}

function reportUnreachable(label, err) {
	console.error(`\nApp could not finish booting — dependency unreachable: ${label}`)
	console.error(err && err.message ? err.message : err)
	process.exit(1)
}

process.on('unhandledRejection', (err) => {
	const message = (err && err.message) || String(err)
	if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN/.test(message)) {
		reportUnreachable('unhandled connection failure during boot (DB/Redis/Kafka)', err)
	}
	reportUnreachable('unhandled rejection during boot', err)
})

process.on('uncaughtException', (err) => {
	const message = (err && err.message) || String(err)
	if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN/.test(message)) {
		reportUnreachable('uncaught connection failure during boot (DB/Redis/Kafka)', err)
	}
	reportUnreachable('uncaught exception during boot', err)
})

// app.js never exports the app — it boots and calls app.listen() itself.
// Patch express's application prototype so the moment app.listen() is
// called (after all routes are registered, before any socket actually
// opens), we grab `this` (the app), dump the route table, and exit —
// instead of letting it bind a port and serve traffic.
const express = require('express')
let captured = false
express.application.listen = function () {
	if (captured) return this
	captured = true
	dumpRoutesAndExit(this)
	return this
}

require(APP_FILE)
