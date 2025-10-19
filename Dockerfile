# Dockerfile simplificado para Railway - Teste inicial
FROM node:18-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json .
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY assistente-temp.js .
COPY calculadoras-financeiras.js .

# Configurações para Railway
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["node", "assistente-temp.js"]