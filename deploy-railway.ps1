# Script de Deploy Automatizado - Railway.app (PowerShell)
# Assistente Financeiro WhatsApp com Gemini 2.0 Flash

param(
    [string]$GeminiApiKey = $env:GEMINI_API_KEY
)

# Configurações
$ErrorActionPreference = "Stop"

# Função para log colorido
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

Write-ColorOutput "🚀 Iniciando Deploy para Railway.app..." "Magenta"
Write-ColorOutput "================================================" "Gray"

try {
    # Verificar se Railway CLI está instalado
    Write-Info "Verificando Railway CLI..."
    $railwayVersion = railway --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Railway CLI não encontrado!"
        Write-Host "Instale com: npm install -g @railway/cli"
        Write-Host "Ou baixe em: https://railway.app/cli"
        exit 1
    }
    Write-Success "Railway CLI encontrado: $railwayVersion"

    # Verificar se está logado
    Write-Info "Verificando autenticação..."
    $user = railway whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Não está logado na Railway. Fazendo login..."
        railway login
        $user = railway whoami
    }
    Write-Success "Usuário Railway: $user"

    # Verificar projeto
    Write-Info "Verificando projeto Railway..."
    $status = railway status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Projeto Railway não encontrado. Criando novo projeto..."
        railway init
    }

    # Preparar arquivos
    Write-Info "Preparando arquivos para deploy..."
    
    # Copiar package.json específico
    Copy-Item "package-assistente.json" "package.json" -Force
    Write-Success "Package.json configurado para Railway"

    # Verificar arquivos essenciais
    $requiredFiles = @(
        "assistente-financeiro.js",
        "calculadoras-financeiras.js", 
        "health-check.js",
        "package.json",
        "Dockerfile"
    )

    foreach ($file in $requiredFiles) {
        if (!(Test-Path $file)) {
            Write-Error "Arquivo obrigatório não encontrado: $file"
            exit 1
        }
    }
    Write-Success "Todos os arquivos obrigatórios encontrados"

    # Configurar variáveis de ambiente
    Write-Info "Configurando variáveis de ambiente..."

    if ([string]::IsNullOrEmpty($GeminiApiKey)) {
        $GeminiApiKey = Read-Host "Digite sua API Key do Gemini"
    }

    # Configurar variáveis na Railway
    $variables = @{
        "GEMINI_API_KEY" = $GeminiApiKey
        "GEMINI_MODEL" = "gemini-2.0-flash-exp"
        "NODE_ENV" = "production"
        "WHATSAPP_SESSION_NAME" = "assistente-financeiro-railway"
        "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = "true"
        "PUPPETEER_EXECUTABLE_PATH" = "/usr/bin/google-chrome-stable"
        "LOG_LEVEL" = "info"
        "DEBUG" = "false"
        "MAX_REQUESTS_PER_MINUTE" = "30"
        "ENABLE_RATE_LIMITING" = "true"
        "TZ" = "America/Sao_Paulo"
    }

    foreach ($var in $variables.GetEnumerator()) {
        railway variables set "$($var.Key)=$($var.Value)"
    }
    Write-Success "Variáveis de ambiente configuradas"

    # Deploy
    Write-Info "Iniciando deploy..."
    railway up --detach

    Write-Success "Deploy iniciado!"

    # Aguardar deploy
    Write-Info "Aguardando conclusão do deploy..."
    Start-Sleep -Seconds 30

    # Verificar status
    Write-Info "Verificando status do deploy..."
    railway status

    # Obter URL do projeto
    Write-Info "Obtendo URL do projeto..."
    $projectUrl = railway domain 2>$null
    if ($projectUrl -and $LASTEXITCODE -eq 0) {
        Write-Success "Projeto disponível em: $projectUrl"
    } else {
        Write-Info "Para obter um domínio, execute: railway domain"
    }

    # Mostrar logs
    Write-Info "Últimos logs do deploy:"
    railway logs --tail 20

    Write-Host ""
    Write-ColorOutput "================================================" "Gray"
    Write-Success "Deploy concluído com sucesso!"
    Write-Host ""
    Write-ColorOutput "📋 Próximos passos:" "Yellow"
    Write-Host "1. Verificar logs: railway logs"
    Write-Host "2. Monitorar status: railway status"
    Write-Host "3. Configurar domínio: railway domain"
    Write-Host "4. Verificar health check: curl `$PROJECT_URL/health"
    Write-Host ""
    Write-ColorOutput "🔧 Comandos úteis:" "Yellow"
    Write-Host "- Ver logs em tempo real: railway logs --follow"
    Write-Host "- Redeploy: railway up"
    Write-Host "- Variáveis: railway variables"
    Write-Host "- Shell remoto: railway shell"
    Write-Host ""
    Write-Success "Assistente Financeiro deployado na Railway! 🎉"

} catch {
    Write-Error "Erro durante o deploy: $($_.Exception.Message)"
    exit 1
}