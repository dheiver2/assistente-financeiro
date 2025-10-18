# 🚀 Template de Deploy Automatizado - Railway.app

> **Assistente Financeiro WhatsApp** - Deploy completo em produção

---

## 📋 Checklist Pré-Deploy

### ✅ Requisitos Obrigatórios
- [ ] Conta no Railway.app criada
- [ ] Railway CLI instalada (`npm install -g @railway/cli`)
- [ ] Chave API Gemini válida
- [ ] Repositório GitHub configurado
- [ ] Arquivos do projeto verificados

### ✅ Verificação de Arquivos
```bash
# Verificar arquivos essenciais
ls -la assistente-financeiro.js
ls -la calculadoras-financeiras.js
ls -la package-assistente.json
ls -la railway.json
ls -la health-check.js
```

---

## 🎯 Método 1: Deploy Automático (Recomendado)

### 1️⃣ Preparação do Repositório
```bash
# Clone ou navegue para o diretório
cd assistente-financeiro

# Copiar package.json otimizado
cp package-assistente.json package.json

# Verificar estrutura
tree -L 2
```

### 2️⃣ Configuração Railway
```bash
# Login no Railway
railway login

# Criar novo projeto
railway new assistente-financeiro-prod

# Conectar ao repositório GitHub
railway connect

# Verificar projeto
railway status
```

### 3️⃣ Configuração de Variáveis
```bash
# Configurar variáveis obrigatórias
railway variables set GEMINI_API_KEY="sua_chave_aqui"
railway variables set GEMINI_MODEL="gemini-2.0-flash-exp"
railway variables set WHATSAPP_SESSION_NAME="assistente-prod"
railway variables set NODE_ENV="production"

# Configurar Puppeteer para Railway
railway variables set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
railway variables set PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

# Configurações de sistema
railway variables set TZ="America/Sao_Paulo"
railway variables set PORT="3000"

# Verificar variáveis
railway variables
```

### 4️⃣ Deploy
```bash
# Deploy inicial
railway up --detach

# Aguardar deploy
sleep 30

# Verificar status
railway status

# Obter URL
railway domain
```

---

## 🛠️ Método 2: Deploy Manual via CLI

### Script Completo (Windows PowerShell)
```powershell
# deploy-railway-complete.ps1

Write-Host "🚀 Iniciando deploy do Assistente Financeiro..." -ForegroundColor Green

# Verificar Railway CLI
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI não encontrada. Instalando..." -ForegroundColor Red
    npm install -g @railway/cli
}

# Login
Write-Host "🔐 Fazendo login no Railway..." -ForegroundColor Yellow
railway login

# Criar projeto
Write-Host "📦 Criando projeto..." -ForegroundColor Yellow
railway new assistente-financeiro-prod

# Preparar arquivos
Write-Host "📁 Preparando arquivos..." -ForegroundColor Yellow
Copy-Item "package-assistente.json" "package.json" -Force

# Verificar arquivos essenciais
$requiredFiles = @(
    "assistente-financeiro.js",
    "calculadoras-financeiras.js", 
    "package.json",
    "railway.json",
    "health-check.js"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Arquivo obrigatório não encontrado: $file" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ $file" -ForegroundColor Green
}

# Configurar variáveis de ambiente
Write-Host "⚙️ Configurando variáveis de ambiente..." -ForegroundColor Yellow

# Solicitar chave Gemini se não estiver definida
if (-not $env:GEMINI_API_KEY) {
    $geminiKey = Read-Host "Digite sua chave API Gemini"
    railway variables set GEMINI_API_KEY="$geminiKey"
} else {
    railway variables set GEMINI_API_KEY="$env:GEMINI_API_KEY"
}

# Configurar outras variáveis
railway variables set GEMINI_MODEL="gemini-2.0-flash-exp"
railway variables set WHATSAPP_SESSION_NAME="assistente-prod"
railway variables set NODE_ENV="production"
railway variables set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
railway variables set PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
railway variables set TZ="America/Sao_Paulo"
railway variables set PORT="3000"

# Deploy
Write-Host "🚀 Iniciando deploy..." -ForegroundColor Yellow
railway up --detach

# Aguardar
Write-Host "⏳ Aguardando deploy (60s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Verificar status
Write-Host "📊 Verificando status..." -ForegroundColor Yellow
railway status

# Obter URL
Write-Host "🌐 Obtendo URL do projeto..." -ForegroundColor Yellow
$url = railway domain
Write-Host "✅ Deploy concluído! URL: $url" -ForegroundColor Green

# Verificar logs
Write-Host "📋 Últimos logs:" -ForegroundColor Yellow
railway logs --tail 20

Write-Host "🎉 Deploy finalizado com sucesso!" -ForegroundColor Green
```

### Script Completo (Linux/Mac)
```bash
#!/bin/bash
# deploy-railway-complete.sh

echo "🚀 Iniciando deploy do Assistente Financeiro..."

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrada. Instalando..."
    npm install -g @railway/cli
fi

# Login
echo "🔐 Fazendo login no Railway..."
railway login

# Criar projeto
echo "📦 Criando projeto..."
railway new assistente-financeiro-prod

# Preparar arquivos
echo "📁 Preparando arquivos..."
cp package-assistente.json package.json

# Verificar arquivos essenciais
required_files=(
    "assistente-financeiro.js"
    "calculadoras-financeiras.js"
    "package.json"
    "railway.json"
    "health-check.js"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Arquivo obrigatório não encontrado: $file"
        exit 1
    fi
    echo "✅ $file"
done

# Configurar variáveis de ambiente
echo "⚙️ Configurando variáveis de ambiente..."

# Solicitar chave Gemini se não estiver definida
if [[ -z "$GEMINI_API_KEY" ]]; then
    read -p "Digite sua chave API Gemini: " gemini_key
    railway variables set GEMINI_API_KEY="$gemini_key"
else
    railway variables set GEMINI_API_KEY="$GEMINI_API_KEY"
fi

# Configurar outras variáveis
railway variables set GEMINI_MODEL="gemini-2.0-flash-exp"
railway variables set WHATSAPP_SESSION_NAME="assistente-prod"
railway variables set NODE_ENV="production"
railway variables set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
railway variables set PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"
railway variables set TZ="America/Sao_Paulo"
railway variables set PORT="3000"

# Deploy
echo "🚀 Iniciando deploy..."
railway up --detach

# Aguardar
echo "⏳ Aguardando deploy (60s)..."
sleep 60

# Verificar status
echo "📊 Verificando status..."
railway status

# Obter URL
echo "🌐 Obtendo URL do projeto..."
url=$(railway domain)
echo "✅ Deploy concluído! URL: $url"

# Verificar logs
echo "📋 Últimos logs:"
railway logs --tail 20

echo "🎉 Deploy finalizado com sucesso!"
```

---

## 📊 Comandos de Monitoramento

### Verificação de Status
```bash
# Status geral
railway status

# Logs em tempo real
railway logs

# Logs específicos (últimas 50 linhas)
railway logs --tail 50

# Métricas de sistema
railway ps

# Variáveis configuradas
railway variables
```

### Health Check Manual
```bash
# Verificar endpoint de saúde
curl https://seu-projeto.railway.app/health

# Verificar resposta da aplicação
curl https://seu-projeto.railway.app/

# Monitoramento contínuo (local)
node railway-monitor.js

# Monitoramento com salvamento
node railway-monitor.js --save
```

---

## 🔧 Comandos de Manutenção

### Atualização de Deploy
```bash
# Redeploy após mudanças
railway up

# Redeploy forçado
railway up --force

# Rollback para versão anterior
railway rollback
```

### Gerenciamento de Variáveis
```bash
# Listar todas as variáveis
railway variables

# Adicionar nova variável
railway variables set NOVA_VAR="valor"

# Remover variável
railway variables delete NOME_VAR

# Editar variável existente
railway variables set GEMINI_API_KEY="nova_chave"
```

### Logs e Debug
```bash
# Logs detalhados
railway logs --verbose

# Logs de erro apenas
railway logs --level error

# Logs de uma data específica
railway logs --since "2024-01-01"

# Exportar logs
railway logs > logs-$(date +%Y%m%d).txt
```

---

## 🚨 Troubleshooting Rápido

### Problema: Deploy falha
```bash
# Verificar logs de build
railway logs --deployment

# Verificar configuração
railway status
railway variables

# Tentar redeploy
railway up --force
```

### Problema: Aplicação não responde
```bash
# Verificar se está rodando
railway ps

# Reiniciar aplicação
railway restart

# Verificar health check
curl https://seu-projeto.railway.app/health
```

### Problema: Erro de memória
```bash
# Verificar uso de recursos
railway ps

# Verificar logs de memória
railway logs | grep -i memory

# Considerar upgrade de plano
railway upgrade
```

---

## 📈 Métricas e KPIs

### Comandos de Monitoramento
```bash
# Verificar uptime
railway ps

# Verificar uso de recursos
railway metrics

# Verificar resposta da API
curl -w "@curl-format.txt" -o /dev/null -s https://seu-projeto.railway.app/health

# Monitoramento automatizado
node railway-monitor.js --watch
```

### Alertas Recomendados
- **Uptime < 99%**: Investigar logs
- **Tempo de resposta > 5s**: Otimizar código
- **Uso de memória > 80%**: Considerar upgrade
- **Erro rate > 1%**: Debug urgente

---

## 🔐 Segurança em Produção

### Checklist de Segurança
- [ ] Variáveis sensíveis não expostas nos logs
- [ ] HTTPS habilitado (automático no Railway)
- [ ] Rate limiting configurado
- [ ] Logs não contêm dados pessoais
- [ ] Backup de sessão WhatsApp configurado

### Comandos de Segurança
```bash
# Verificar variáveis expostas
railway variables | grep -v "API_KEY\|SECRET\|PASSWORD"

# Verificar logs por dados sensíveis
railway logs | grep -i "password\|token\|secret"

# Rotacionar chaves (exemplo)
railway variables set GEMINI_API_KEY="nova_chave_segura"
```

---

## 📞 Suporte e Recursos

### Links Úteis
- **Railway Docs**: https://docs.railway.app
- **Railway Status**: https://status.railway.app
- **Gemini API**: https://ai.google.dev
- **WhatsApp Web.js**: https://wwebjs.dev

### Comandos de Ajuda
```bash
# Ajuda geral
railway help

# Ajuda específica
railway help deploy
railway help variables
railway help logs

# Versão da CLI
railway version
```

---

## ✅ Checklist Final

### Pré-Deploy
- [ ] Arquivos verificados
- [ ] Variáveis configuradas
- [ ] Railway CLI instalada
- [ ] Chave Gemini válida

### Pós-Deploy
- [ ] URL funcionando
- [ ] Health check OK
- [ ] Logs sem erros
- [ ] WhatsApp conectando
- [ ] Monitoramento ativo

### Manutenção
- [ ] Backup de sessão configurado
- [ ] Alertas configurados
- [ ] Documentação atualizada
- [ ] Time treinado

---

**🎉 Deploy Concluído com Sucesso!**

> Para suporte técnico, consulte os logs e documentação do Railway.app