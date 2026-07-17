# AGENTS.md

## Purpose

This repository contains the ELEVATE User Service (`com.shikshalokam.mentoring.userservice`), a Node.js/Express API for user, organization, role/permission, invite, and tenant workflows.

## Repository Layout

-   `src/` - Main service codebase (this is where almost all work happens).
-   `src/app.js` - Service entrypoint.
-   `src/routes/index.js` - Dynamic API router and global error handling.
-   `src/controllers/v1/` - Versioned controller endpoints.
-   `src/services/` - Business logic layer.
-   `src/database/` - Sequelize models, queries, migrations, seeders.
-   `src/middlewares/` - Express middlewares: `authenticator.js` (JWT/auth), `pagination.js`, `validator.js`. All routes pass through these; touch with care.
-   `src/validators/v1/` - Request validation schemas (one per controller). Every new endpoint should have a matching validator here.
-   `src/generics/` - Shared infrastructure utilities: `utils.js` (large general helpers), `materializedViews.js`, `kafka-communication.js`, `redis-communication.js`, `RollbackStack.js`. Check here before writing new utility code.
-   `src/dtos/` - Data transfer objects for user, org, tenant, and events. Update when adding or changing fields in API responses.
-   `src/constants/` - App-wide constants: `common.js`, `blacklistConfig.js`, endpoint definitions. Don't define new constants inline in services/controllers.
-   `src/locales/` - i18n string files (`en.json`, `hi.json`). All user-facing messages must be added here, not hardcoded.
-   `src/configs/` - Kafka, Redis, cache, cloud-storage, queue worker setup.
-   `src/scripts/` - Operational scripts and data migration utilities.
-   `src/health-checks/` - Health check endpoints and config.
-   `dev-ops/` - Dependency docker compose and reporting helpers.
-   `README.md` - Full setup docs and dependency installation notes.

## Stack and Runtime

-   Node.js 20 (recommended in `README.md`)
-   Express 4
-   PostgreSQL (with Citus in some deployments)
-   Sequelize + `sequelize-cli`
-   Redis
-   Kafka (`kafkajs`)
-   BullMQ worker (invites and bulk-user workflows)

## Critical Context

-   Run service commands from `src/`, not repo root.
-   Repo root has a minimal `package.json` used for tooling; the real app package is `src/package.json`.
-   App startup validates env vars via `src/envVariables.js`; missing required vars will stop boot.
-   Route format is dynamic:
    -   `${APPLICATION_BASE_URL}/:version/:controller/:method`
    -   `${APPLICATION_BASE_URL}/:version/:controller/:file/:method`

## Local Setup (Fast Path)

1. `cd src`
2. `cp .env.sample .env`
3. Fill required env values (see `src/envVariables.js` and `src/.env.sample`)
4. `npm install`
5. `npm run db:migrate`
6. `npm run db:seed:all` (optional but common for local)
7. `npm start`

Default local app URL is typically `http://localhost:3001` (or `APPLICATION_PORT` from `.env`).

## Core Commands

From `src/`:

-   `npm start` - run in development with nodemon
-   `npm run prod` - production mode
-   `npm run qa` / `npm run stage` - environment-specific starts
-   `npm run db:init` - create DB + migrate
-   `npm run db:migrate` - run migrations
-   `npm run db:seed:all` - run all seeders
    > **Note:** Tests (unit and integration) are currently broken and should not be run. Omit any test steps until further notice.

## Important Env Groups

See full list in `src/envVariables.js`; key groups:

-   App/Auth: `APPLICATION_*`, `ACCESS_TOKEN_*`, `REFRESH_TOKEN_*`, `API_DOC_URL`
-   Database: `DEV_DATABASE_URL`, `TEST_DATABASE_URL`, `DATABASE_URL`, `DB_POOL_*`
-   Kafka: `KAFKA_URL`, `KAFKA_GROUP_ID`, event topic toggles and topic names
-   Redis/Cache: `REDIS_HOST`, `INTERNAL_CACHE_EXP_TIME`
-   Storage: `CLOUD_STORAGE_PROVIDER`, `CLOUD_STORAGE_*`, `PUBLIC_ASSET_BUCKETNAME`
-   Integrations: `MENTORING_SERVICE_URL`, `ENTITY_MANAGEMENT_SERVICE_BASE_URL`, scheduler and notification vars

## Health Endpoints

-   `GET /health`
-   `GET /healthCheckStatus`

Health config lives in `src/health-checks/health.config.js` and currently checks kafka, redis, postgres, plus dependent services.

## Operational Scripts

From `src/`:

-   `npm run migrate:tenant-org-data` - tenant/org data move script
-   `npm run check:user-in-account-search -- --auth-token=<token> ...` - paginated account search checker
-   `node scripts/insertDefaultOrg.js` - bootstrap default org
-   `node scripts/encryptDecryptEmails.js encrypt|decrypt`

More script notes: `src/scripts/readme.md`.

## Code Style and Tooling

-   ESLint rules: `src/.eslintrc.json` (tabs, single quotes, no semicolons)
-   Prettier: `.prettierrc.json` at repo root
-   Husky pre-commit runs `lint-staged` from `src/`

## Module Aliases

Defined in `src/package.json` under `_moduleAliases`. Always use these instead of relative paths:

| Alias            | Resolves to          |
| ---------------- | -------------------- |
| `@root`          | `src/`               |
| `@configs`       | `src/configs/`       |
| `@constants`     | `src/constants/`     |
| `@controllers`   | `src/controllers/`   |
| `@database`      | `src/database/`      |
| `@generics`      | `src/generics/`      |
| `@health-checks` | `src/health-checks/` |
| `@middlewares`   | `src/middlewares/`   |
| `@routes`        | `src/routes/`        |
| `@services`      | `src/services/`      |
| `@validators`    | `src/validators/`    |
| `@utils`         | `src/utils/`         |
| `@helpers`       | `src/helpers/`       |
| `@scripts`       | `src/scripts/`       |
| `@dtos`          | `src/dtos/`          |
| `@public`        | `src/public/`        |

## Implementation Guardrails

-   Keep controller-service-query layering intact.
-   Preserve response shape used by router/error middleware (`statusCode`, `responseCode`, `message`, `result`, `meta`).
-   For DB schema changes, add Sequelize migrations in `src/database/migrations/`.
-   Prefer updating existing query/service modules instead of embedding raw SQL in controllers.
-   If changing env requirements, update both `src/envVariables.js` and `src/.env.sample`.
-   All user-facing strings must be added to `src/locales/en.json` (and `hi.json` if translatable). Never hardcode message strings in services or controllers.

## Pull Request Instructions

1. Keep PRs focused on one logical change (avoid mixing refactor + feature + migration unless required).
2. Rebase/sync with latest target branch before opening PR.
3. Run lint validation from `src/`:
    - `npx eslint .` (if lint-sensitive files changed)
        > **Note:** Unit and integration tests are currently broken — skip test steps.
4. Include migration/rollback notes in PR description when touching `src/database/migrations/`.
5. If env/config changes are introduced, update:
    - `src/.env.sample`
    - `src/envVariables.js`
    - relevant README/notes
6. PR description should include:
    - What changed
    - Why it changed
    - Risk/impact
    - Test evidence (commands + summary, if applicable — tests currently broken)
    - API contract changes (if any)

## Commit Message Format

Use Conventional Commit style:

-   `<type>(<scope>): <subject>`

Example:

-   `refactor(organization): optimize feature access logic for role mappings`

Allowed `type` values:

-   `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`

Scope guidance:

-   Use module/domain names such as `organization`, `user`, `tenant`, `roles`, `scripts`, `migrations`, `health-checks`, `configs`.

Subject guidance:

-   Use imperative mood and keep it concise.
-   Do not end subject with a period.

## Useful References

-   Main setup and infra guidance: `README.md`
-   Sequelize path mapping: `src/.sequelizerc`
-   Citus distribution SQL helper: `src/distributionColumns.sql`
-   Health check guide: `src/health-checks/README.md`
