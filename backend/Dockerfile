# ---- Base ----
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json backend/package.json
RUN pnpm install --frozen-lockfile

# ---- Development ----
FROM dependencies AS development
COPY backend/src ./backend/src
COPY backend/test ./backend/test
COPY backend/nest-cli.json backend/nest-cli.json
COPY backend/tsconfig.json backend/tsconfig.json
COPY backend/tsconfig.build.json backend/tsconfig.build.json
CMD ["pnpm", "--filter", "@cti-platform/backend", "start:dev"]

# ---- Build ----
FROM dependencies AS build
COPY backend/src ./backend/src
COPY backend/nest-cli.json backend/nest-cli.json
COPY backend/tsconfig.json backend/tsconfig.json
COPY backend/tsconfig.build.json backend/tsconfig.build.json
RUN pnpm --filter @cti-platform/backend build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json backend/package.json
RUN pnpm install --filter @cti-platform/backend --frozen-lockfile --prod
COPY --chown=node:node --from=build /app/backend/dist ./backend/dist
USER node
CMD ["node", "backend/dist/main.js"]
