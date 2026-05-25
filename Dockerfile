# Vertiplay — imagem Docker para DigitalOcean App Platform / Droplet
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate || true
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3030
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3030
# Boot: aplica schema Prisma no Postgres (idempotente) + sobe Next.js.
# db push é seguro pra MVP — se schema mudar, cria/altera tabelas; se já
# bater, no-op. Quando migrarmos pra "prisma migrate deploy" trocamos aqui.
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && exec npx next start -p 3030"]
