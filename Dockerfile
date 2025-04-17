FROM node:23-alpine AS base
WORKDIR /app
RUN npm install -g pnpm
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch --prod=false
RUN pnpm install --frozen-lockfile --offline --prod=false
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY . .
ENV NODE_ENV=production
RUN pnpm build
FROM node:23-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  ENTRYPOINT wget --quiet --tries=1 --spider http://localhost:${PORT}/ || exit 1
ENTRYPOINT ["node", "server.js"]
