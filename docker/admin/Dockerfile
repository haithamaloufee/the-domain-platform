FROM node:26-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@11.12.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/admin/ apps/admin/
COPY apps/website/package.json apps/website/package.json
COPY packages/ packages/
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm install --frozen-lockfile --filter @the-domain/admin... && pnpm --filter @the-domain/admin build

FROM node:26-bookworm-slim AS runtime
WORKDIR /app
COPY --from=build --chown=node:node /app /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
EXPOSE 8080
USER node
WORKDIR /app/apps/admin
CMD ["node", "node_modules/next/dist/bin/next", "start"]
