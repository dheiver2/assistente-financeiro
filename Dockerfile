# Dockerfile simplificado para Railway
FROM node:18-slim

# Instalar dependências básicas para Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Instalar Chromium (mais leve que Chrome)
RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package-hibrido.json package.json
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY assistente-hibrido.js .
COPY calculadoras-financeiras.js .

# Criar diretório para sessão do WhatsApp
RUN mkdir -p /app/.wwebjs_auth && chown -R pptruser:pptruser /app/.wwebjs_auth

# Configurar variáveis de ambiente para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV CHROME_PATH=/usr/bin/google-chrome-stable
ENV DISPLAY=:99

# Configurações para Railway
ENV NODE_ENV=production
ENV PORT=3000

# Mudar para usuário não-root
USER pptruser

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["node", "assistente-hibrido.js"]