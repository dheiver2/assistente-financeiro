# 🚀 Guia de Deploy - Assistente Financeiro WhatsApp

> Guia completo para deploy em produção com diferentes opções e trade-offs

---

## 📋 **Resumo Executivo**

| Opção | Facilidade | Custo/mês | Uptime | Recomendação |
|-------|------------|-----------|--------|--------------|
| **VPS Digital Ocean** | ⭐⭐⭐⭐ | $6 | 99.9% | 🥇 **MELHOR** |
| **Railway.app** | ⭐⭐⭐⭐⭐ | $5 | 99.5% | 🥈 Mais Fácil |
| **Render.com** | ⭐⭐⭐⭐ | $7 | 99.0% | 🥉 Alternativa |
| **VPS Contabo** | ⭐⭐⭐ | $4 | 99.8% | 💰 Mais Barato |

---

## 🎯 **Opção 1: VPS Digital Ocean (RECOMENDADO)**

### **Por que escolher:**
- ✅ Controle total do ambiente
- ✅ Preço previsível ($6/mês)
- ✅ Excelente uptime (99.9%)
- ✅ Fácil debug e monitoramento
- ✅ Escalabilidade simples

### **Comandos de Deploy:**

```bash
# 1. Criar droplet Ubuntu 22.04 (1GB RAM, $6/mês)
# Via painel Digital Ocean ou CLI

# 2. Conectar via SSH
ssh root@SEU_IP_DO_SERVIDOR

# 3. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# 4. Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 5. Clonar projeto
git clone https://github.com/SEU_USUARIO/whatsapp-assistant.git
cd whatsapp-assistant

# 6. Configurar variáveis
cp .env.example .env
nano .env  # Editar com suas configurações

# 7. Deploy
docker-compose up -d

# 8. Verificar logs
docker-compose logs -f assistente-financeiro
```

### **Configuração de Firewall:**
```bash
# Configurar UFW
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

---

## 🎯 **Opção 2: Railway.app (MAIS FÁCIL)**

### **Por que escolher:**
- ✅ Deploy automático via Git
- ✅ Zero configuração de servidor
- ✅ SSL automático
- ✅ Logs integrados
- ⚠️ Pode hibernar (plano gratuito)

### **Passos de Deploy:**

1. **Preparar projeto:**
```bash
# Criar railway.json
echo '{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "node assistente-financeiro.js"
  }
}' > railway.json
```

2. **Deploy via Railway:**
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Criar projeto
railway new

# Deploy
railway up
```

3. **Configurar variáveis:**
```bash
# Via CLI
railway variables set GEMINI_API_KEY=sua_chave_aqui
railway variables set GEMINI_MODEL=gemini-2.0-flash-exp
railway variables set NUMERO_AUTORIZADO=5582871705003

# Ou via painel web: railway.app
```

---

## 🎯 **Opção 3: Render.com**

### **Por que escolher:**
- ✅ Interface amigável
- ✅ CI/CD automático
- ✅ SSL gratuito
- ⚠️ Cold starts (15s delay)

### **Passos de Deploy:**

1. **Conectar repositório no Render.com**
2. **Configurar serviço:**
   - **Build Command:** `npm install`
   - **Start Command:** `node assistente-financeiro.js`
   - **Environment:** Docker

3. **Variáveis de ambiente:**
```
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.0-flash-exp
NUMERO_AUTORIZADO=5582871705003
NODE_ENV=production
```

---

## 🎯 **Opção 4: VPS Contabo (MAIS BARATO)**

### **Por que escolher:**
- ✅ Preço imbatível ($4/mês)
- ✅ Recursos generosos (4GB RAM)
- ⚠️ Suporte limitado
- ⚠️ Interface menos amigável

### **Comandos similares ao Digital Ocean:**
```bash
# Mesmo processo do Digital Ocean
# Apenas criar VPS no painel Contabo
```

---

## 🔧 **Scripts de Deploy Automatizado**

### **deploy.sh (Para VPS):**
```bash
#!/bin/bash
# Script de deploy automatizado

echo "🚀 Iniciando deploy do Assistente Financeiro..."

# Parar containers existentes
docker-compose down

# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose up -d --build

# Verificar status
docker-compose ps

echo "✅ Deploy concluído!"
echo "📊 Logs: docker-compose logs -f assistente-financeiro"
```

### **update.sh (Atualizações):**
```bash
#!/bin/bash
# Script de atualização

echo "🔄 Atualizando Assistente Financeiro..."

# Backup da sessão WhatsApp
docker cp assistente-financeiro:/app/.wwebjs_auth ./backup_session_$(date +%Y%m%d_%H%M%S)

# Atualizar
git pull origin main
docker-compose up -d --build

echo "✅ Atualização concluída!"
```

---

## 📊 **Monitoramento e Logs**

### **Comandos Essenciais:**
```bash
# Ver logs em tempo real
docker-compose logs -f assistente-financeiro

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Backup da sessão WhatsApp
docker cp assistente-financeiro:/app/.wwebjs_auth ./backup_session

# Restaurar sessão
docker cp ./backup_session assistente-financeiro:/app/.wwebjs_auth
```

### **Health Checks:**
```bash
# Verificar se está respondendo
curl -f http://localhost:3000/health || echo "Serviço offline"

# Verificar logs de erro
docker-compose logs assistente-financeiro | grep -i error
```

---

## 🔒 **Segurança em Produção**

### **Checklist de Segurança:**
- [ ] **Firewall configurado** (apenas portas necessárias)
- [ ] **Usuário não-root** no container
- [ ] **Variáveis de ambiente** seguras (não no código)
- [ ] **SSL/TLS** habilitado
- [ ] **Logs limitados** (rotação automática)
- [ ] **Backup regular** da sessão WhatsApp
- [ ] **Rate limiting** ativo
- [ ] **Monitoramento** de recursos

### **Configurações de Segurança:**
```bash
# Limitar logs
echo '{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}' > /etc/docker/daemon.json

# Restart Docker
systemctl restart docker
```

---

## 🚨 **Troubleshooting**

### **Problemas Comuns:**

1. **Container não inicia:**
```bash
# Verificar logs
docker-compose logs assistente-financeiro

# Verificar recursos
free -h
df -h
```

2. **WhatsApp não conecta:**
```bash
# Limpar sessão
docker-compose down
docker volume rm whatsapp-web_whatsapp_sessions
docker-compose up -d
```

3. **Gemini API não responde:**
```bash
# Testar API
docker-compose exec assistente-financeiro node teste-gemini-2-flash.js
```

4. **Alto uso de memória:**
```bash
# Limitar recursos no docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
```

---

## 📈 **Métricas de Monitoramento**

### **KPIs Essenciais:**
- **Uptime:** > 99.5%
- **Tempo de resposta:** < 3s
- **Uso de memória:** < 80%
- **Taxa de erro:** < 1%
- **Mensagens processadas/hora:** Conforme demanda

### **Alertas Recomendados:**
```bash
# Script de monitoramento simples
#!/bin/bash
# monitor.sh

CONTAINER="assistente-financeiro"
MEMORY_LIMIT=80
CPU_LIMIT=80

# Verificar se container está rodando
if ! docker ps | grep -q $CONTAINER; then
    echo "🚨 ALERTA: Container $CONTAINER não está rodando!"
    # Enviar notificação (email, Slack, etc.)
fi

# Verificar uso de recursos
MEMORY_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" $CONTAINER | sed 's/%//')
if (( $(echo "$MEMORY_USAGE > $MEMORY_LIMIT" | bc -l) )); then
    echo "🚨 ALERTA: Uso de memória alto: ${MEMORY_USAGE}%"
fi
```

---

## 🎯 **Recomendação Final**

### **Para Iniciantes:** Railway.app
- Deploy em 5 minutos
- Zero configuração
- $5/mês

### **Para Produção:** Digital Ocean VPS
- Controle total
- Melhor custo-benefício
- Escalabilidade

### **Comandos Rápidos (Digital Ocean):**
```bash
# Deploy completo em 10 comandos
ssh root@SEU_IP
curl -fsSL https://get.docker.com | sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
git clone SEU_REPOSITORIO
cd whatsapp-assistant
cp .env.example .env
nano .env  # Configurar variáveis
docker-compose up -d
docker-compose logs -f assistente-financeiro
```

**🎉 Pronto! Seu assistente estará online em menos de 15 minutos!**