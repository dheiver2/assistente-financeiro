# Dockerfile para Railway - Versão Baileys (Leve)
# Usar imagem Node.js slim (muito mais leve)
FROM node:18-slim

# Instalar apenas dependências essenciais
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json ./
RUN npm install --production && npm cache clean --force

# Copiar código da aplicação
COPY assistente-baileys.js .
COPY calculadoras-financeiras.js .

# Criar diretório para autenticação do Baileys
RUN mkdir -p baileys_auth && chown -R appuser:appuser /app

# Configurações para Railway
ENV NODE_ENV=production
ENV PORT=3000
ENV WHATSAPP_ENABLED=true

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["node", "assistente-baileys.js"]