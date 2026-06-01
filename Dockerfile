FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist/ ./dist/
COPY src/lib/db/migrations/ ./dist/lib/db/migrations/

RUN mkdir -p /home/container/data

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
