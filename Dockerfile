# Use Node.js 18 slim para menor tamanho
FROM node:18-slim

# Instalar apenas dependências básicas
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json
COPY package-assistente.json package.json
COPY package-lock.json* ./

# Instalar dependências
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi && npm cache clean --force

# Copiar arquivos da aplicação
COPY assistente-financeiro.js .
COPY calculadoras-financeiras.js .
COPY health-check.js .
COPY railway.json .

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "assistente-financeiro.js"]