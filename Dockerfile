# Estágio 1: Instalação de Dependências
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./

RUN npm config set registry https://registry.npmmirror.com
RUN npm config set strict-ssl false

RUN npm install --omit=dev

# Estágio 2: Ambiente de Execução Leve
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia apenas as dependências de produção do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
# Copia os arquivos fonte do projeto
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]