// src/generics/cacheHelper.js
/* eslint-disable no-console */
const { RedisCache, InternalCache } = require('elevate-node-cache')
const md5 = require('md5')
const common = require('@constants/common')

/** CONFIG */
const CACHE_CONFIG = (() => {
	try {
		if (process.env.CACHE_CONFIG) return JSON.parse(process.env.CACHE_CONFIG)
		return common.CACHE_CONFIG
	} catch {
		return common.CACHE_CONFIG
	}
})()

const ENABLE_CACHE = pickBool(CACHE_CONFIG.enableCache, true)
const SHARDS = toInt(CACHE_CONFIG.shards, 32)
const BATCH = toInt(CACHE_CONFIG.scanBatch, 1000)
const SHARD_RETENTION_DAYS = toInt(CACHE_CONFIG.shardRetentionDays, 7)

// Version config
const VERSION_CACHE_TTL = toInt(CACHE_CONFIG.versionCacheTtlSeconds, 5) // seconds, short in-process TTL
const VERSION_DEFAULT = toInt(CACHE_CONFIG.versionDefault || 0, 0)

/** Helpers */
function toInt(v, d) {
	const n = parseInt(v, 10)
	return Number.isFinite(n) ? n : d
}
function pickBool(v, d) {
	if (typeof v === 'boolean') return v
	if (typeof v === 'string') return ['1', 'true', 'yes'].includes(v.toLowerCase())
	return d
}

function tenantKey(tenantCode, parts = []) {
	return ['tenant', tenantCode, ...parts].join(':')
}
function orgKey(tenantCode, orgId, parts = []) {
	return ['tenant', tenantCode, 'org', orgId, ...parts].join(':')
}
function namespaceEnabled(ns) {
	if (!ns) return true
	const nsCfg = CACHE_CONFIG.namespaces && CACHE_CONFIG.namespaces[ns]
	return !(nsCfg && nsCfg.enabled === false)
}

/**
 * TTL resolution for namespace.
 * callerTtl (explicit) wins.
 * fallback to namespace.defaultTtl.
 * fallback to undefined (no expiry).
 */
function nsTtl(ns, callerTtl) {
	if (callerTtl != null) return Number(parseInt(callerTtl, 10))
	const nsCfg = CACHE_CONFIG.namespaces && CACHE_CONFIG.namespaces[ns]
	const v = nsCfg && nsCfg.defaultTtl
	return v != null ? Number(parseInt(v, 10)) : undefined
}

/**
 * Determine whether to use internal (in-memory) cache for this namespace.
 * callerUseInternal (explicit param) wins.
 * Otherwise check namespace.useInternal, then global CACHE_CONFIG.useInternal, then false.
 */
function nsUseInternal(ns, callerUseInternal) {
	if (typeof callerUseInternal === 'boolean') return callerUseInternal
	const nsCfg = CACHE_CONFIG.namespaces && CACHE_CONFIG.namespaces[ns]
	if (nsCfg && typeof nsCfg.useInternal === 'boolean') return nsCfg.useInternal
	if (typeof CACHE_CONFIG.useInternal === 'boolean') return CACHE_CONFIG.useInternal
	return false
}

function namespacedKey({ tenantCode, orgId, ns, id }) {
	const base = orgId ? orgKey(tenantCode, orgId, []) : tenantKey(tenantCode, [])
	return [base, ns, id].filter(Boolean).join(':')
}

async function versionedKey({ tenantCode, orgId, ns, id, key }) {
	return buildVersionedKey({ tenantCode, orgId, ns, id, key })
}
function shardOf(key) {
	const h = md5(key)
	const asInt = parseInt(h.slice(0, 8), 16)
	return (asInt >>> 0) % SHARDS
}

/** In-process short cache for version lookups */
const _versionCache = new Map() // key -> { ver: number, expiresAt: timestamp }

/** Low-level redis client (best-effort) */
function getRedisClient() {
	try {
		if (RedisCache && typeof RedisCache.native === 'function') return RedisCache.native()
	} catch (err) {
		console.log(err, 'error in getting native redis client')
	}
}

/** Version key name resolution */
function versionKeyName({ tenantCode, orgId, ns }) {
	if (tenantCode && orgId && ns) return `__version:tenant:${tenantCode}:org:${orgId}:ns:${ns}`
	if (tenantCode && ns) return `__version:tenant:${tenantCode}:ns:${ns}`
	if (tenantCode) return `__version:tenant:${tenantCode}`
	return `__version:global`
}

/** Get version from in-process cache or Redis (short TTL). */
async function getVersion({ tenantCode, orgId, ns } = {}) {
	const vKey = versionKeyName({ tenantCode, orgId, ns })
	const cached = _versionCache.get(vKey)
	if (cached && cached.expiresAt > Date.now()) return cached.ver

	try {
		// try Redis via wrapper
		if (RedisCache && typeof RedisCache.getKey === 'function') {
			const raw = await RedisCache.getKey(vKey)
			const ver = raw ? parseInt(raw, 10) || VERSION_DEFAULT : VERSION_DEFAULT
			_versionCache.set(vKey, { ver, expiresAt: Date.now() + VERSION_CACHE_TTL * 1000 })
			return ver
		}
	} catch (e) {
		console.error('getVersion redis read error', e)
	}

	// fallback default
	_versionCache.set(vKey, { ver: VERSION_DEFAULT, expiresAt: Date.now() + VERSION_CACHE_TTL * 1000 })
	return VERSION_DEFAULT
}

/**
 * Bump version atomically for the given level.
 * Preferred method is native Redis INCR. Fallback to read+set.
 * Returns new version number.
 */
async function bumpVersion({ tenantCode, orgId, ns } = {}) {
	const vKey = versionKeyName({ tenantCode, orgId, ns })
	const redis = getRedisClient()
	try {
		if (redis && typeof redis.incr === 'function') {
			// atomic increment
			const newVer = await redis.incr(vKey)
			// Ensure wrapper reflects new value (best-effort)
			try {
				if (RedisCache && typeof RedisCache.setKey === 'function') {
					await RedisCache.setKey(vKey, String(newVer))
				}
			} catch (_) {}
			_versionCache.set(vKey, { ver: Number(newVer), expiresAt: Date.now() + VERSION_CACHE_TTL * 1000 })
			return Number(newVer)
		}
		// fallback: read + increment + set
		const currRaw = await RedisCache.getKey(vKey)
		const curr = currRaw ? parseInt(currRaw, 10) || VERSION_DEFAULT : VERSION_DEFAULT
		const newVer = curr + 1
		await RedisCache.setKey(vKey, String(newVer))
		_versionCache.set(vKey, { ver: newVer, expiresAt: Date.now() + VERSION_CACHE_TTL * 1000 })
		return newVer
	} catch (e) {
		console.error('bumpVersion error', e)
		// as last resort update in-memory and return incremented value
		const currCached = _versionCache.get(vKey)
		const curr = currCached ? currCached.ver : VERSION_DEFAULT
		const newVer = curr + 1
		_versionCache.set(vKey, { ver: newVer, expiresAt: Date.now() + VERSION_CACHE_TTL * 1000 })
		try {
			await RedisCache.setKey(vKey, String(newVer))
		} catch (_) {}
		return newVer
	}
}

/** Build final key with version token inserted so patterns still match. */
async function buildVersionedKey({ tenantCode, orgId, ns, id, key }) {
	// If caller provided ns or id, treat as namespaced. Matches previous behavior:
	// previous code used ns || id ? namespacedKey({ ns: ns || 'ns', id: id||key }) : tenantKey(tenantCode, [key])
	const isNamespaced = Boolean(ns || id)
	if (isNamespaced) {
		const effNs = ns || 'ns'
		const ver = await getVersion({ tenantCode, orgId, ns: effNs })
		const base = orgId ? orgKey(tenantCode, orgId, []) : tenantKey(tenantCode, [])
		const final = [base, effNs, `v${ver}`, id || key].filter(Boolean).join(':')
		return final
	}
	// tenant-level key
	const ver = await getVersion({ tenantCode })
	const base = tenantKey(tenantCode, [])
	const final = [base, `v${ver}`, key].filter(Boolean).join(':')
	return final
}

/** Base ops (Internal cache opt-in via config or caller) */
async function get(key, { useInternal = false } = {}) {
	if (!ENABLE_CACHE) return null
	// Try Redis first
	try {
		const val = await RedisCache.getKey(key)
		if (val !== null && val !== undefined) return val
	} catch (e) {
		console.error('redis get error', e)
	}
	// Only hit InternalCache if explicitly requested
	if (useInternal && InternalCache && InternalCache.getKey) {
		try {
			return InternalCache.getKey(key)
		} catch (e) {
			/* ignore internal errors */
		}
	}
	return null
}

async function set(key, value, ttlSeconds, { useInternal = false } = {}) {
	if (!ENABLE_CACHE) return false
	let wroteRedis = false
	try {
		if (ttlSeconds) await RedisCache.setKey(key, value, ttlSeconds)
		else await RedisCache.setKey(key, value)
		wroteRedis = true
	} catch (e) {
		console.error('redis set error', e)
	}
	// Only write to InternalCache if opted in
	if (useInternal && InternalCache && InternalCache.setKey) {
		try {
			InternalCache.setKey(key, value)
		} catch (e) {}
	}
	return wroteRedis
}

async function del(key, { useInternal = false } = {}) {
	try {
		await RedisCache.deleteKey(key)
	} catch (e) {
		console.error('redis del error', e)
	}
	if (useInternal && InternalCache && InternalCache.delKey) {
		try {
			InternalCache.delKey(key)
		} catch (e) {}
	}
}

/**
 * getOrSet
 * - key (fallback id)
 * - tenantCode
 * - ttl (optional): explicit TTL seconds
 * - fetchFn: function that returns value
 * - orgId, ns, id: for namespaced keys
 * - useInternal: optional boolean override. If omitted, resolved from namespace/config.
 *
 * NOTE: This function now resolves a versioned key internally.
 */
async function getOrSet({ key, tenantCode, ttl = undefined, fetchFn, orgId, ns, id, useInternal = undefined }) {
	if (!namespaceEnabled(ns)) return await fetchFn()

	const resolvedUseInternal = nsUseInternal(ns, useInternal)
	// build versioned key (keeps previous behaviour but adds version token)
	const fullKey =
		ns || id
			? await buildVersionedKey({ tenantCode, orgId, ns: ns || 'ns', id: id || key })
			: await buildVersionedKey({ tenantCode, key })

	const cached = await get(fullKey, { useInternal: resolvedUseInternal })
	if (cached !== null && cached !== undefined) return cached

	const value = await fetchFn()
	if (value !== undefined) {
		await set(fullKey, value, nsTtl(ns, ttl), { useInternal: resolvedUseInternal })
	}
	return value
}

/** Scoped set that uses namespace TTL and namespace useInternal setting
 * Returns the versioned key that was written.
 */
async function setScoped({ tenantCode, orgId, ns, id, value, ttl = undefined, useInternal = undefined }) {
	if (!namespaceEnabled(ns)) return null
	const resolvedUseInternal = nsUseInternal(ns, useInternal)
	const fullKey = await buildVersionedKey({ tenantCode, orgId, ns, id })
	await set(fullKey, value, nsTtl(ns, ttl), { useInternal: resolvedUseInternal })
	return fullKey
}

/** Scoped delete that uses namespace config (TTL/useInternal)
 * Returns the versioned key that was deleted.
 */
async function delScoped({ tenantCode, orgId, ns, id, useInternal = undefined }) {
	if (!namespaceEnabled(ns)) return null
	const resolvedUseInternal = nsUseInternal(ns, useInternal)
	const fullKey = await buildVersionedKey({ tenantCode, orgId, ns, id })
	await del(fullKey, { useInternal: resolvedUseInternal })
	return fullKey
}

/**
 * Evict all keys for a namespace.
 * If orgId is provided will target org-level keys, otherwise tenant-level keys.
 * patternSuffix defaults to '*' (delete all keys under the namespace).
 *
 * NOTE: Because version is a token between ns and id, the glob pattern `tenant:acme:users:*`
 * will match versioned keys like `tenant:acme:users:v3:...`.
 */
async function evictNamespace({ tenantCode, orgId = null, ns, patternSuffix = '*' } = {}) {
	if (!tenantCode || !ns) return
	if (!namespaceEnabled(ns)) return
	const base = orgId ? `tenant:${tenantCode}:org:${orgId}` : `tenant:${tenantCode}`
	const pattern = `${base}:${ns}:${patternSuffix}`
	await scanAndDelete(pattern)
}

/**
 * Eviction helpers using SCAN by pattern.
 * These do not require any tracked sets. Caller should build patterns to match keys to remove.
 *
 * - scanAndDelete(pattern, opts)
 *    pattern: glob-style pattern for SCAN (e.g. "tenant:acme:org:123:*")
 *    opts.batchSize: number of keys to fetch per SCAN iteration (default BATCH)
 *    opts.unlink: if true will attempt UNLINK when available
 */
async function scanAndDelete(pattern, { batchSize = BATCH, unlink = true } = {}) {
	const redis = getRedisClient()
	if (!redis) return
	let cursor = '0'
	do {
		// redis.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize)
		const res = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize)
		cursor = res && res[0] ? res[0] : '0'
		const keys = res && res[1] ? res[1] : []
		if (keys.length) {
			// try unlink as best-effort
			try {
				if (unlink && typeof redis.unlink === 'function') await redis.unlink(...keys)
				else await redis.del(...keys)
			} catch (e) {
				// fallback to individual deletes
				for (const k of keys) {
					try {
						if (unlink && typeof redis.unlink === 'function') await redis.unlink(k)
						else await redis.del(k)
					} catch (__) {}
				}
			}
		}
	} while (cursor !== '0')
}

/** Evict all keys for a tenant + org by pattern */
async function evictOrgByPattern(tenantCode, orgId, { patternSuffix = '*' } = {}) {
	if (!tenantCode || !orgId) return
	const pattern = `tenant:${tenantCode}:org:${orgId}:${patternSuffix}`
	await scanAndDelete(pattern)
}

/** Evict tenant-level keys by pattern */
async function evictTenantByPattern(tenantCode, { patternSuffix = '*' } = {}) {
	if (!tenantCode) return
	const pattern = `tenant:${tenantCode}:${patternSuffix}`
	await scanAndDelete(pattern)
}

/** Convenience invalidation by bumping version (fast) */
async function invalidateNamespaceVersion({ tenantCode, orgId = null, ns } = {}) {
	if (!tenantCode || !ns) return
	return bumpVersion({ tenantCode, orgId, ns })
}
async function invalidateTenantVersion({ tenantCode, ns } = {}) {
	if (!tenantCode) return
	return bumpVersion({ tenantCode, ns })
}
async function invalidateOrgNamespaceVersion({ tenantCode, orgId, ns } = {}) {
	if (!tenantCode || !orgId || !ns) return
	return bumpVersion({ tenantCode, orgId, ns })
}

/** Public API */
module.exports = {
	// Base ops
	get,
	set,
	del,
	getOrSet,
	tenantKey,

	// Scoped helpers
	setScoped,
	namespacedKey,
	versionedKey,

	// Eviction (pattern based)
	delScoped,
	evictNamespace,
	evictOrgByPattern,
	evictTenantByPattern,
	scanAndDelete,

	// Versioning API
	getVersion,
	bumpVersion,
	invalidateNamespaceVersion,
	invalidateTenantVersion,
	invalidateOrgNamespaceVersion,

	// Introspection
	_internal: {
		getRedisClient,
		SHARDS,
		BATCH,
		ENABLE_CACHE,
		CACHE_CONFIG,
		VERSION_CACHE_TTL,
		VERSION_DEFAULT,
	},
}
