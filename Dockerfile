FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./

RUN npm config set registry https://registry.npmmirror.com
RUN npm config set strict-ssl false

RUN npm install --omit=dev

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]