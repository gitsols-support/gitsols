# Multi-stage Dockerfile for @gitsols/api.
# Build with the monorepo root as context:
#   docker build -f apps/api/Dockerfile -t gitsols-api .

# ─── Stage 1: deps ──────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app

# Enable corepack — pins the pnpm version declared in the root package.json's
# `packageManager` field. No global pnpm install required.
RUN corepack enable

# Manifests for the workspace + the api + the packages it depends on.
# pnpm-workspace.yaml is required so pnpm can resolve workspace packages.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
# The API depends on @gitsols/types AND @gitsols/constants (constants depends on
# types). Every workspace manifest it pulls must be present for pnpm to resolve.
COPY packages/types/package.json ./packages/types/
COPY packages/constants/package.json ./packages/constants/
COPY packages/utils/package.json ./packages/utils/

# --no-frozen-lockfile keeps the deploy resilient to lockfile drift; --ignore-scripts
# for a hermetic deps stage.
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# ─── Stage 2: build ─────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Build shared packages first, then the api itself.
RUN pnpm build:packages
RUN pnpm exec turbo build --filter=@gitsols/api

# `pnpm deploy` produces a self-contained directory with the api + its
# production dependencies — no workspace symlinks in the final image.
RUN pnpm --filter=@gitsols/api --prod deploy /app/api-runtime

# ─── Stage 3: runtime ───────────────────────────────────────────────────
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

CMD ["node", "dist/main.js"]
