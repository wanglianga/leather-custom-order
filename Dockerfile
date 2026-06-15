FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.js ./vite.config.js

EXPOSE 4173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
