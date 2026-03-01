# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev

# ─── Runtime Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy backend dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy server code and public frontend
COPY server/ ./server/
COPY public/ ./public/

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
