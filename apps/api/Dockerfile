# Multi-stage Dockerfile for @gitsols/api.
# Build with the monorepo root as context (Railway does this automatically):
#   docker build -f apps/api/Dockerfile -t gitsols-api .

# ─── Stage 1: build ─────────────────────────────────────────────────────
# A single build stage with the FULL workspace present. This is deliberate:
# pnpm creates per-package node_modules (workspace symlinks for @gitsols/*,
# plus transitive deps like clsx / tailwind-merge) during install. Copying only
# the root node_modules across stages drops those, which is what broke the
# earlier build. Installing with all sources in place resolves everything.
FROM node:24-alpine AS build
WORKDIR /app

# Enable corepack — pins the pnpm version from the root package.json
# `packageManager` field.
RUN corepack enable

# Copy the whole workspace. node_modules / .next / dist are excluded via
# .dockerignore so we always do a clean, reproducible install.
COPY . .

# Install every workspace dependency with full source present.
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Build shared packages first, then the API.
RUN pnpm build:packages
RUN pnpm exec turbo build --filter=@gitsols/api

# `pnpm deploy` produces a self-contained directory (api + production deps,
# no workspace symlinks). The drizzle/ migrations folder ships with it so the
# release-time migrator can find the SQL files.
RUN pnpm --filter=@gitsols/api --prod deploy /app/api-runtime

# ─── Stage 2: runtime ───────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Non-root user for runtime.
RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/api-runtime ./

USER app
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health/live').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Railway overrides this with the migrate-then-start command in railway.json.
CMD ["node", "dist/main.js"]
