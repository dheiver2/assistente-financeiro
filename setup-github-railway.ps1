# Setup GitHub e Deploy Railway - Assistente Financeiro
# Script PowerShell para automatizar todo o processo

param(
    [string]$GeminiApiKey = "",
    [string]$GitHubRepo = "https://github.com/dheiver2/assistente-financeiro",
    [switch]$SkipGitHub = $false,
    [switch]$SkipRailway = $false
)

Write-Host "🚀 SETUP COMPLETO - ASSISTENTE FINANCEIRO" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "GitHub: $GitHubRepo" -ForegroundColor Cyan
Write-Host "Plataforma: Railway.app" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green

# Função para verificar se comando existe
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Função para executar comando com verificação
function Invoke-SafeCommand {
    param($Command, $Description)
    Write-Host "⚡ $Description..." -ForegroundColor Yellow
    try {
        Invoke-Expression $Command
        Write-Host "✅ $Description - Concluído" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $Description - Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. VERIFICAÇÕES INICIAIS
Write-Host "`n📋 VERIFICAÇÕES INICIAIS" -ForegroundColor Magenta

# Verificar Git
if (-not (Test-Command "git")) {
    Write-Host "❌ Git não encontrado. Instale o Git primeiro." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git encontrado" -ForegroundColor Green

# Verificar Node.js
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js encontrado" -ForegroundColor Green

# Verificar Railway CLI
if (-not (Test-Command "railway")) {
    Write-Host "⚠️ Railway CLI não encontrada. Instalando..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if (-not (Test-Command "railway")) {
        Write-Host "❌ Falha ao instalar Railway CLI" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Railway CLI encontrada" -ForegroundColor Green

# 2. PREPARAÇÃO DOS ARQUIVOS
Write-Host "`n📁 PREPARAÇÃO DOS ARQUIVOS" -ForegroundColor Magenta

# Verificar arquivos essenciais
$requiredFiles = @(
    "assistente-financeiro.js",
    "calculadoras-financeiras.js",
    "package-assistente.json",
    "railway.json",
    "health-check.js",
    "railway-monitor.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - ARQUIVO OBRIGATÓRIO NÃO ENCONTRADO" -ForegroundColor Red
        exit 1
    }
}

# Copiar package.json otimizado
Copy-Item "package-assistente.json" "package.json" -Force
Write-Host "✅ package.json atualizado para Railway" -ForegroundColor Green

# 3. CONFIGURAÇÃO DO GITHUB (se não for pulado)
if (-not $SkipGitHub) {
    Write-Host "`n🐙 CONFIGURAÇÃO DO GITHUB" -ForegroundColor Magenta
    
    # Verificar se já é um repositório Git
    if (-not (Test-Path ".git")) {
        Invoke-SafeCommand "git init" "Inicializando repositório Git"
    }
    
    # Verificar se remote origin existe
    $remoteExists = git remote get-url origin 2>$null
    if (-not $remoteExists) {
        Invoke-SafeCommand "git remote add origin $GitHubRepo" "Adicionando remote origin"
    } else {
        Write-Host "✅ Remote origin já configurado: $remoteExists" -ForegroundColor Green
    }
    
    # Criar .gitignore se não existir
    if (-not (Test-Path ".gitignore")) {
        @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# WhatsApp session data
.wwebjs_auth/
.wwebjs_cache/
session-*

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Railway
.railway/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host "✅ .gitignore criado" -ForegroundColor Green
    }
    
    # Criar README.md se não existir
    if (-not (Test-Path "README.md")) {
        $readmeContent = @"
# Assistente Financeiro WhatsApp

Assistente inteligente para WhatsApp com calculadoras financeiras e IA Gemini.

## Deploy Rapido

### Railway.app (Recomendado)
1. Fork este repositorio
2. Conecte ao Railway.app
3. Configure as variaveis de ambiente
4. Deploy automatico!

### Variaveis de Ambiente Obrigatorias
- GEMINI_API_KEY: Sua chave da API Gemini
- WHATSAPP_SESSION_NAME: Nome da sessao WhatsApp

## Documentacao
- Guia de Deploy Railway: ./RAILWAY-DEPLOY.md
- Template de Deploy: ./deploy-template.md

## Desenvolvimento Local
npm install
npm start

## Monitoramento
node railway-monitor.js

---
Desenvolvido para facilitar sua vida financeira!
"@
        $readmeContent | Out-File -FilePath "README.md" -Encoding UTF8
        Write-Host "✅ README.md criado" -ForegroundColor Green
    }
    
    # Adicionar arquivos ao Git
    Invoke-SafeCommand "git add ." "Adicionando arquivos ao Git"
    
    # Commit
    $commitMessage = "feat: Assistente Financeiro WhatsApp com deploy Railway"
    Invoke-SafeCommand "git commit -m `"$commitMessage`"" "Fazendo commit inicial"
    
    # Push para GitHub
    Write-Host "📤 Fazendo push para GitHub..." -ForegroundColor Yellow
    try {
        git push -u origin main 2>$null
        if ($LASTEXITCODE -ne 0) {
            # Tentar com master se main falhar
            git push -u origin master
        }
        Write-Host "✅ Push para GitHub concluído" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Erro no push. Verifique suas credenciais do GitHub." -ForegroundColor Yellow
        Write-Host "Execute manualmente: git push -u origin main" -ForegroundColor Cyan
    }
}

# 4. CONFIGURAÇÃO DO RAILWAY (se não for pulado)
if (-not $SkipRailway) {
    Write-Host "`n🚂 CONFIGURAÇÃO DO RAILWAY" -ForegroundColor Magenta
    
    # Login no Railway
    Write-Host "🔐 Fazendo login no Railway..." -ForegroundColor Yellow
    railway login
    
    # Criar projeto
    Write-Host "📦 Criando projeto no Railway..." -ForegroundColor Yellow
    railway new assistente-financeiro-prod
    
    # Conectar ao GitHub (se configurado)
    if (-not $SkipGitHub) {
        Write-Host "🔗 Conectando ao repositório GitHub..." -ForegroundColor Yellow
        try {
            railway connect
            Write-Host "✅ Conectado ao GitHub" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Erro ao conectar GitHub. Configure manualmente no painel Railway." -ForegroundColor Yellow
        }
    }
    
    # Configurar variáveis de ambiente
    Write-Host "⚙️ Configurando variáveis de ambiente..." -ForegroundColor Yellow
    
    # Solicitar chave Gemini se não fornecida
    if (-not $GeminiApiKey) {
        $GeminiApiKey = Read-Host "Digite sua chave API Gemini"
    }
    
    if ($GeminiApiKey) {
        railway variables set GEMINI_API_KEY="$GeminiApiKey"
        Write-Host "✅ GEMINI_API_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "⚠️ GEMINI_API_KEY não configurada. Configure manualmente." -ForegroundColor Yellow
    }
    
    # Configurar outras variáveis
    $envVars = @{
        "GEMINI_MODEL" = "gemini-2.0-flash-exp"
        "WHATSAPP_SESSION_NAME" = "assistente-prod"
        "NODE_ENV" = "production"
        "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = "true"
        "PUPPETEER_EXECUTABLE_PATH" = "/usr/bin/google-chrome-stable"
        "TZ" = "America/Sao_Paulo"
        "PORT" = "3000"
    }
    
    foreach ($var in $envVars.GetEnumerator()) {
        try {
            railway variables set "$($var.Key)=$($var.Value)"
            Write-Host "✅ $($var.Key) configurada" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Erro ao configurar $($var.Key)" -ForegroundColor Yellow
        }
    }
    
    # Iniciar deploy
    Write-Host "🚀 Iniciando deploy..." -ForegroundColor Yellow
    railway up --detach
    
    # Aguardar deploy
    Write-Host "⏳ Aguardando deploy (60 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    # Verificar status
    Write-Host "📊 Verificando status do deploy..." -ForegroundColor Yellow
    railway status
    
    # Obter URL
    Write-Host "🌐 Obtendo URL do projeto..." -ForegroundColor Yellow
    try {
        $projectUrl = railway domain
        Write-Host "✅ URL do projeto: $projectUrl" -ForegroundColor Green
        
        # Testar health check
        Write-Host "🏥 Testando health check..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        try {
            $healthResponse = Invoke-WebRequest -Uri "$projectUrl/health" -TimeoutSec 30
            if ($healthResponse.StatusCode -eq 200) {
                Write-Host "✅ Health check OK!" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Health check retornou status: $($healthResponse.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ Health check falhou. Verifique os logs." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "⚠️ Erro ao obter URL. Verifique no painel Railway." -ForegroundColor Yellow
    }
    
    # Mostrar logs
    Write-Host "📋 Últimos logs:" -ForegroundColor Yellow
    railway logs --tail 20
}

# 5. RESUMO FINAL
Write-Host "`n🎉 SETUP CONCLUÍDO!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

if (-not $SkipGitHub) {
    Write-Host "✅ Repositório GitHub configurado: $GitHubRepo" -ForegroundColor Green
}

if (-not $SkipRailway) {
    Write-Host "✅ Deploy Railway iniciado" -ForegroundColor Green
    Write-Host "📊 Monitoramento: railway status" -ForegroundColor Cyan
    Write-Host "📋 Logs: railway logs" -ForegroundColor Cyan
    Write-Host "🌐 URL: railway domain" -ForegroundColor Cyan
}

Write-Host "`n📚 PRÓXIMOS PASSOS:" -ForegroundColor Magenta
Write-Host "1. Verificar se o deploy foi bem-sucedido no painel Railway" -ForegroundColor White
Write-Host "2. Testar o assistente enviando uma mensagem no WhatsApp" -ForegroundColor White
Write-Host "3. Monitorar logs e métricas regularmente" -ForegroundColor White
Write-Host "4. Configurar alertas e backup da sessão WhatsApp" -ForegroundColor White

Write-Host "`n🛠️ COMANDOS ÚTEIS:" -ForegroundColor Magenta
Write-Host "railway status          # Status do projeto" -ForegroundColor Cyan
Write-Host "railway logs           # Ver logs" -ForegroundColor Cyan
Write-Host "railway variables      # Ver variáveis" -ForegroundColor Cyan
Write-Host "railway restart        # Reiniciar aplicação" -ForegroundColor Cyan
Write-Host "node railway-monitor.js # Monitoramento local" -ForegroundColor Cyan

Write-Host "`n📞 SUPORTE:" -ForegroundColor Magenta
Write-Host "- Documentação: ./RAILWAY-DEPLOY.md" -ForegroundColor White
Write-Host "- Template: ./deploy-template.md" -ForegroundColor White
Write-Host "- Railway Docs: https://docs.railway.app" -ForegroundColor White

Write-Host "`n🚀 Assistente Financeiro pronto para uso!" -ForegroundColor Green