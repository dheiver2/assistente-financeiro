#!/bin/bash

# Script de Deploy Automatizado - Railway.app
# Assistente Financeiro WhatsApp com Gemini 2.0 Flash

set -e  # Parar em caso de erro

echo "🚀 Iniciando Deploy para Railway.app..."
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    log_error "Railway CLI não encontrado!"
    echo "Instale com: npm install -g @railway/cli"
    echo "Ou: curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

# Verificar se está logado na Railway
if ! railway whoami &> /dev/null; then
    log_warning "Não está logado na Railway. Fazendo login..."
    railway login
fi

log_info "Usuário Railway: $(railway whoami)"

# Verificar se existe projeto Railway
if ! railway status &> /dev/null; then
    log_warning "Projeto Railway não encontrado. Criando novo projeto..."
    railway init
fi

# Preparar arquivos para deploy
log_info "Preparando arquivos para deploy..."

# Copiar package.json específico
cp package-assistente.json package.json
log_success "Package.json configurado para Railway"

# Verificar arquivos essenciais
REQUIRED_FILES=(
    "assistente-financeiro.js"
    "calculadoras-financeiras.js"
    "health-check.js"
    "package.json"
    "Dockerfile"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        log_error "Arquivo obrigatório não encontrado: $file"
        exit 1
    fi
done

log_success "Todos os arquivos obrigatórios encontrados"

# Configurar variáveis de ambiente
log_info "Configurando variáveis de ambiente..."

# Verificar se GEMINI_API_KEY está definida
if [[ -z "${GEMINI_API_KEY}" ]]; then
    log_warning "GEMINI_API_KEY não encontrada no ambiente"
    read -p "Digite sua API Key do Gemini: " GEMINI_API_KEY
fi

# Configurar variáveis na Railway
railway variables set GEMINI_API_KEY="$GEMINI_API_KEY"
railway variables set GEMINI_MODEL="gemini-2.0-flash-exp"
railway variables set NODE_ENV="production"
railway variables set WHATSAPP_SESSION_NAME="assistente-financeiro-railway"
railway variables set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
railway variables set PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
railway variables set LOG_LEVEL="info"
railway variables set DEBUG="false"
railway variables set MAX_REQUESTS_PER_MINUTE="30"
railway variables set ENABLE_RATE_LIMITING="true"
railway variables set TZ="America/Sao_Paulo"

log_success "Variáveis de ambiente configuradas"

# Deploy
log_info "Iniciando deploy..."
railway up --detach

log_success "Deploy iniciado!"

# Aguardar deploy
log_info "Aguardando conclusão do deploy..."
sleep 30

# Verificar status
log_info "Verificando status do deploy..."
railway status

# Obter URL do projeto
PROJECT_URL=$(railway domain)
if [[ -n "$PROJECT_URL" ]]; then
    log_success "Projeto disponível em: $PROJECT_URL"
else
    log_info "Para obter um domínio, execute: railway domain"
fi

# Mostrar logs
log_info "Últimos logs do deploy:"
railway logs --tail 20

echo ""
echo "================================================"
log_success "Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verificar logs: railway logs"
echo "2. Monitorar status: railway status"
echo "3. Configurar domínio: railway domain"
echo "4. Verificar health check: curl \$PROJECT_URL/health"
echo ""
echo "🔧 Comandos úteis:"
echo "- Ver logs em tempo real: railway logs --follow"
echo "- Redeploy: railway up"
echo "- Variáveis: railway variables"
echo "- Shell remoto: railway shell"
echo ""
log_success "Assistente Financeiro deployado na Railway! 🎉"