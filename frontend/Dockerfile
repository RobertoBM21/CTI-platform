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
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
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
COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --from=build /app/frontend/public ./frontend/public
EXPOSE 3000
CMD ["node", "frontend/server.js"]
