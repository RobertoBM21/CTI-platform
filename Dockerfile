# ---- Base ----
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# ---- Development ----
FROM base AS development
COPY pnpm-lock.yaml package.json ./
RUN pnpm install
COPY . .
CMD ["pnpm", "start:dev"]

# ---- Build ----
FROM dependencies AS build
COPY . .
RUN pnpm build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
