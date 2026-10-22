# Generated for Stock Intelix MCP Server
# Multi-platform lightweight container for Glama, Cursor, and Claude Desktop
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV STOCK_INTELIX_BASE_URL=https://stockintelix.com

# Create non-root user for container security
USER node

COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/index.js ./

ENTRYPOINT ["node", "index.js"]
