# Dockerfile para Assistente Financeiro WhatsApp
# Otimizado para Railway.app com Puppeteer e Chrome

FROM node:18-slim

# Instalar dependências do sistema para Puppeteer e Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json específico para assistente
COPY package-assistente.json package.json

# Copiar package-lock.json se existir, senão usar npm install
COPY package-lock.json* ./

# Instalar dependências (usar npm install se package-lock.json não existir)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi && npm cache clean --force

# Copiar código da aplicação
COPY assistente-financeiro.js .
COPY calculadoras-financeiras.js .
COPY health-check.js .
COPY railway.json .

# Criar diretório para sessões do WhatsApp
RUN mkdir -p /app/.wwebjs_auth

# Configurar variáveis de ambiente para Puppeteer (Railway)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

# Health check otimizado para Railway
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s --retries=3 \
    CMD node health-check.js || exit 1

# Railway usa PORT dinâmico
EXPOSE $PORT

# Comando de inicialização
CMD ["npm", "start"]