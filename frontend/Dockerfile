# ---- Base ----
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS dependencies
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY frontend/package.json frontend/package.json
RUN pnpm install --frozen-lockfile --filter @cti-platform/frontend

# ---- Development ----
FROM dependencies AS development
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/next.config.ts frontend/next.config.ts
COPY frontend/tsconfig.json frontend/tsconfig.json
COPY frontend/postcss.config.mjs frontend/postcss.config.mjs
COPY frontend/components.json frontend/components.json
CMD ["pnpm", "--filter", "@cti-platform/frontend", "dev"]

# ---- Build ----
FROM dependencies AS build
ARG API_URL=http://localhost:3000
ENV API_URL=$API_URL
ENV NEXT_TELEMETRY_DISABLED=1 
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/next.config.ts frontend/next.config.ts
COPY frontend/tsconfig.json frontend/tsconfig.json
COPY frontend/postcss.config.mjs frontend/postcss.config.mjs
COPY frontend/components.json frontend/components.json
RUN pnpm --filter @cti-platform/frontend build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
COPY --chown=node:node --from=build /app/frontend/.next/standalone ./
COPY --chown=node:node --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --chown=node:node --from=build /app/frontend/public ./frontend/public
USER node
EXPOSE 3000
CMD ["node", "frontend/server.js"]
