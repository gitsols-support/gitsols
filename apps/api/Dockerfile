# Single-stage image for @gitsols/api.
#
# We deliberately DO NOT use `pnpm deploy` to extract a slim runtime: against
# this monorepo it intermittently leaves the @gitsols/* workspace packages as
# dangling symlinks (→ "Cannot find module '@gitsols/types'" at boot). Instead
# we build and run from the full workspace, where apps/api/node_modules/@gitsols/*
# always resolve because packages/ is present in the image. Larger image, but
# 100% reliable.

FROM node:24-alpine
WORKDIR /app
RUN corepack enable

# Whole workspace (node_modules/.next/dist excluded via .dockerignore).
COPY . .

# Install all deps, then build shared packages + the API.
RUN pnpm install --no-frozen-lockfile --ignore-scripts
RUN pnpm build:packages
RUN pnpm exec turbo build --filter=@gitsols/api

ENV NODE_ENV=production

# Run from the API package dir so:
#   - require('@gitsols/types') resolves via apps/api/node_modules → packages/
#   - migrate.js finds ./drizzle/migrations
WORKDIR /app/apps/api
EXPOSE 4000

# main.js runs migrations + admin seed in-process, then serves.
CMD ["node", "dist/main.js"]
