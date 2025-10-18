# 🚀 Deploy Railway.app - Assistente Financeiro WhatsApp

> **Guia completo para deploy do Assistente Financeiro WhatsApp na Railway.app com Gemini 2.0 Flash**

---

## 📋 Resumo Executivo

**Railway.app** é a opção **mais simples** para deploy do assistente financeiro, oferecendo:

- ✅ **Deploy em 1 clique** com GitHub
- ✅ **Infraestrutura gerenciada** (sem configuração de servidor)
- ✅ **Escalabilidade automática**
- ✅ **SSL/HTTPS gratuito**
- ✅ **Logs em tempo real**
- ✅ **$5/mês** para uso básico

---

## 🎯 Pré-requisitos

### Obrigatórios
- [ ] Conta no [Railway.app](https://railway.app)
- [ ] Conta no [GitHub](https://github.com)
- [ ] [API Key do Google Gemini](https://makersuite.google.com/app/apikey)
- [ ] [Railway CLI](https://docs.railway.app/develop/cli) (opcional, mas recomendado)

### Recomendados
- [ ] Git configurado
- [ ] Node.js 18+ (para testes locais)

---

## 🚀 Método 1: Deploy Automático (Recomendado)

### Passo 1: Preparar Repositório GitHub

```bash
# 1. Clonar/criar repositório
git clone https://github.com/dheiver2/assistente-financeiro.git
cd assistente-financeiro

# 2. Adicionar arquivos de configuração Railway
# (Os arquivos já estão incluídos no projeto)

# 3. Commit e push
git add .
git commit -m "feat: configuração Railway.app"
git push origin main
```

### Passo 2: Deploy na Railway

1. **Acesse [Railway.app](https://railway.app)**
2. **Clique em "Start a New Project"**
3. **Selecione "Deploy from GitHub repo"**
4. **Escolha o repositório `dheiver2/assistente-financeiro`**
5. **Railway detectará automaticamente o Dockerfile**

### Passo 3: Configurar Variáveis de Ambiente

No painel da Railway, vá em **Variables** e adicione:

```env
GEMINI_API_KEY=sua_api_key_aqui
GEMINI_MODEL=gemini-2.0-flash-exp
NODE_ENV=production
WHATSAPP_SESSION_NAME=assistente-financeiro-railway
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
LOG_LEVEL=info
DEBUG=false
MAX_REQUESTS_PER_MINUTE=30
ENABLE_RATE_LIMITING=true
TZ=America/Sao_Paulo
```

### Passo 4: Verificar Deploy

1. **Aguardar build** (3-5 minutos)
2. **Verificar logs** na aba "Deployments"
3. **Confirmar status** "Running"

---

## 🛠️ Método 2: Deploy via CLI

### Instalação Railway CLI

```bash
# NPM
npm install -g @railway/cli

# Ou download direto
curl -fsSL https://railway.app/install.sh | sh
```

### Deploy Automatizado

#### Windows (PowerShell)
```powershell
# Executar script automatizado
.\deploy-railway.ps1

# Ou manual
railway login
railway init
railway up
```

#### Linux/Mac (Bash)
```bash
# Executar script automatizado
chmod +x deploy-railway.sh
./deploy-railway.sh

# Ou manual
railway login
railway init
railway up
```

---

## 📊 Monitoramento e Logs

### Comandos Essenciais

```bash
# Ver logs em tempo real
railway logs --follow

# Status do projeto
railway status

# Variáveis configuradas
railway variables

# Redeploy
railway up

# Shell remoto
railway shell

# Métricas
railway metrics
```

### Health Check

```bash
# Verificar saúde da aplicação
curl https://seu-projeto.railway.app/health

# Resposta esperada:
# {"status":"healthy","timestamp":"2024-01-XX","checks":[...]}
```

---

## 🔧 Configurações Avançadas

### Custom Domain

```bash
# Configurar domínio personalizado
railway domain add meudominio.com

# Verificar DNS
railway domain list
```

### Scaling

```bash
# Configurar recursos
railway variables set RAILWAY_MEMORY_LIMIT=1024
railway variables set RAILWAY_CPU_LIMIT=1000
```

### Backup de Sessão WhatsApp

```bash
# Download da sessão
railway volume download .wwebjs_auth ./backup-sessao/

# Upload da sessão
railway volume upload ./backup-sessao/ .wwebjs_auth
```

---

## 💰 Custos Railway.app

| Plano | Preço | Recursos | Recomendado Para |
|-------|-------|----------|------------------|
| **Hobby** | $0/mês | 500h/mês, 1GB RAM | Testes |
| **Pro** | $5/mês | Ilimitado, 8GB RAM | **Produção** |
| **Team** | $20/mês | Multi-usuário | Empresas |

**💡 Recomendação:** Plano Pro ($5/mês) para uso em produção.

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Build Falha
```bash
# Verificar logs de build
railway logs --deployment

# Soluções:
- Verificar Dockerfile
- Confirmar package.json
- Checar dependências
```

#### 2. Puppeteer Não Funciona
```bash
# Verificar variáveis Puppeteer
railway variables | grep PUPPETEER

# Deve mostrar:
# PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

#### 3. WhatsApp Não Conecta
```bash
# Verificar logs
railway logs --follow | grep -i whatsapp

# Soluções:
- Resetar sessão: deletar volume .wwebjs_auth
- Verificar QR code nos logs
- Confirmar WHATSAPP_SESSION_NAME único
```

#### 4. Gemini API Erro
```bash
# Verificar API Key
railway variables | grep GEMINI_API_KEY

# Testar API Key
railway shell
node -e "console.log(process.env.GEMINI_API_KEY)"
```

### Comandos de Debug

```bash
# Logs detalhados
railway logs --follow --deployment

# Variáveis de ambiente
railway variables

# Status completo
railway status --json

# Shell interativo
railway shell

# Restart forçado
railway up --detach
```

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] **API Keys** em variáveis de ambiente (nunca no código)
- [ ] **HTTPS** habilitado (automático na Railway)
- [ ] **Rate limiting** ativado
- [ ] **Logs** sem informações sensíveis
- [ ] **Domínio personalizado** (opcional)
- [ ] **Backup** da sessão WhatsApp

### Variáveis Sensíveis

```bash
# Nunca commitar no Git:
GEMINI_API_KEY=xxx
NUMERO_AUTORIZADO=xxx

# Sempre usar Railway Variables
railway variables set GEMINI_API_KEY="sua_key_aqui"
```

---

## 📈 Métricas e KPIs

### Métricas Importantes

```bash
# CPU e Memória
railway metrics

# Logs de performance
railway logs | grep -E "(memory|cpu|response)"

# Uptime
railway status
```

### Alertas Recomendados

- **CPU > 80%** por 5 minutos
- **Memória > 90%** por 5 minutos
- **Erro rate > 5%** por 10 minutos
- **Response time > 30s** por 5 minutos

---

## 🔄 CI/CD Automático

### GitHub Actions (Opcional)

```yaml
# .github/workflows/railway-deploy.yml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
```

---

## 📞 Suporte e Recursos

### Links Úteis

- 📚 [Documentação Railway](https://docs.railway.app)
- 💬 [Discord Railway](https://discord.gg/railway)
- 🐛 [GitHub Issues](https://github.com/dheiver2/assistente-financeiro/issues)
- 📧 [Suporte Railway](https://railway.app/help)

### Comandos de Emergência

```bash
# Rollback para deploy anterior
railway rollback

# Parar aplicação
railway down

# Restart completo
railway restart

# Backup completo
railway backup create
```

---

## ✅ Checklist Final

### Pré-Deploy
- [ ] Repositório GitHub configurado
- [ ] API Key Gemini válida
- [ ] Railway CLI instalado
- [ ] Variáveis de ambiente definidas

### Pós-Deploy
- [ ] Build concluído com sucesso
- [ ] Aplicação "Running"
- [ ] Logs sem erros críticos
- [ ] Health check respondendo
- [ ] WhatsApp conectado
- [ ] Gemini funcionando

### Produção
- [ ] Domínio personalizado (opcional)
- [ ] Monitoramento configurado
- [ ] Backup da sessão
- [ ] Alertas configurados

---

## 🎉 Próximas Ações

1. **Testar assistente** enviando mensagem WhatsApp
2. **Monitorar logs** primeiras 24h
3. **Configurar alertas** de monitoramento
4. **Documentar** números autorizados
5. **Backup** sessão WhatsApp regularmente

---

**🚀 Deploy concluído! Seu Assistente Financeiro está rodando na Railway.app!**

> **💡 Dica:** Mantenha este guia como referência para futuras atualizações e troubleshooting.