#!/usr/bin/env pwsh
# Script para configurar variáveis de ambiente na Railway
# Autor: Engenheiro Full-Stack Sênior (Agente)

Write-Host "🚀 Configurando variáveis de ambiente na Railway..." -ForegroundColor Green

# Verificar se está logado na Railway
Write-Host "📋 Verificando login na Railway..." -ForegroundColor Yellow
$railwayStatus = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro: Não está logado na Railway. Execute 'railway login' primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logado como: $railwayStatus" -ForegroundColor Green

# Verificar se existe um projeto ativo
Write-Host "📋 Verificando projeto ativo..." -ForegroundColor Yellow
$projectStatus = railway status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro: Nenhum projeto Railway ativo. Execute 'railway init' primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Projeto ativo encontrado" -ForegroundColor Green

# Configurar variáveis de ambiente essenciais
Write-Host "🔧 Configurando variáveis de ambiente..." -ForegroundColor Yellow

# Configurar todas as variáveis de uma vez
Write-Host "  📝 Configurando todas as variáveis..." -ForegroundColor Cyan
railway variables --set "GEMINI_API_KEY=AIzaSyAR46OI-_IuGy_V7p9GKKnySfDi1gsYDqg" --set "GEMINI_MODEL=gemini-2.0-flash-exp" --set "WHATSAPP_SESSION_NAME=assistente-financeiro" --set "NUMERO_AUTORIZADO=5582871705003" --set "NODE_ENV=production" --set "PORT=3000" --set "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true" --set "PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable" --set "TZ=America/Sao_Paulo" --set "LOG_LEVEL=info" --set "DEBUG=false" --set "MAX_REQUESTS_PER_MINUTE=30" --set "ENABLE_RATE_LIMITING=true" --set "RAILWAY_ENVIRONMENT=production"

Write-Host "✅ Todas as variáveis de ambiente foram configuradas!" -ForegroundColor Green

# Verificar variáveis configuradas
Write-Host "📋 Verificando variáveis configuradas..." -ForegroundColor Yellow
railway variables

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Execute 'railway up' para fazer o deploy" -ForegroundColor White
Write-Host "   2. Execute 'railway logs' para monitorar os logs" -ForegroundColor White
Write-Host "   3. Execute 'railway status' para verificar o status" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Links úteis:" -ForegroundColor Yellow
Write-Host "   • Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "   • Logs: railway logs --follow" -ForegroundColor White
Write-Host "   • Métricas: railway metrics" -ForegroundColor White