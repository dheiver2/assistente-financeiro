# Dockerfile para Railway - Versão Híbrida com WhatsApp
# Usar imagem otimizada para Puppeteer
FROM ghcr.io/puppeteer/puppeteer:21.11.0

# Instalar curl para health check
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Voltar para usuário puppeteer
USER pptruser

# Definir diretório de trabalho
WORKDIR /home/pptruser/app

# Copiar package.json e instalar dependências
COPY --chown=pptruser:pptruser package.json ./
RUN npm install --production && npm cache clean --force

# Copiar código da aplicação
COPY --chown=pptruser:pptruser assistente-hibrido.js .
COPY --chown=pptruser:pptruser calculadoras-financeiras.js .

# Configurações para Railway
ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["npm", "start"]