# 🤖 Como Usar o Assistente Financeiro WhatsApp

## 🚀 Início Rápido

### 1. Configurar API do Gemini
```bash
# Obtenha sua chave em: https://makersuite.google.com/app/apikey
# Edite o arquivo .env e adicione:
GEMINI_API_KEY=sua_chave_aqui
```

### 2. Executar o Assistente
```bash
node assistente-financeiro.js
```

### 3. Escanear QR Code
- O navegador abrirá automaticamente
- Escaneie o QR Code com seu WhatsApp
- Aguarde a mensagem "Cliente conectado!"

---

## 📱 Como Interagir

### Número Autorizado
**Apenas o número `5582 87170503` pode usar o assistente**

### Comandos Disponíveis

#### `/start` - Iniciar conversa
```
Usuário: /start
Bot: 👋 Olá! Sou seu assistente financeiro pessoal...
```

#### `/help` - Ver ajuda
```
Usuário: /help
Bot: 📋 COMANDOS DISPONÍVEIS:
/start - Iniciar conversa
/help - Ver esta ajuda
/calculadora - Calculadoras financeiras
/dicas - Dicas de investimento
```

#### `/calculadora` - Menu de cálculos
```
Usuário: /calculadora
Bot: 🧮 CALCULADORAS DISPONÍVEIS:
1️⃣ Juros Compostos
2️⃣ Planejamento Aposentadoria
3️⃣ Financiamento SAC
4️⃣ Financiamento PRICE
5️⃣ Impacto da Inflação
6️⃣ Regra dos 72
7️⃣ Comparar Investimentos
```

#### `/dicas` - Dicas financeiras
```
Usuário: /dicas
Bot: 💡 DICAS FINANCEIRAS:
• Mantenha reserva de emergência
• Diversifique seus investimentos
• Invista regularmente (disciplina)
...
```

---

## 💬 Exemplos de Conversas

### Pergunta Livre
```
Usuário: "Tenho R$ 10.000 para investir, o que você recomenda?"

Bot: 💰 **Estratégia para R$ 10.000**
📊 **Análise:**
- Valor interessante para diversificar
- Recomendo começar conservador

🎯 **Sugestão:**
• 60% Renda Fixa (R$ 6.000)
• 30% Fundos (R$ 3.000)  
• 10% Reserva (R$ 1.000)

💡 **Próximos passos:**
Qual seu objetivo? Aposentadoria, casa própria?
```

### Cálculo Específico
```
Usuário: "Quanto preciso investir por mês para ter R$ 1 milhão em 20 anos?"

Bot: 🎯 **Planejamento para R$ 1.000.000**

📊 **Cenários (20 anos):**
• Taxa 8% ao ano: R$ 1.698/mês
• Taxa 10% ao ano: R$ 1.317/mês  
• Taxa 12% ao ano: R$ 1.013/mês

💡 **Dica:** Comece com o que conseguir e aumente gradualmente!
```

### Comparação de Investimentos
```
Usuário: "CDB ou Tesouro Selic?"

Bot: ⚖️ **CDB vs Tesouro Selic**

🏦 **CDB:**
✅ Garantia do FGC até R$ 250k
✅ Rentabilidade pode ser maior
❌ Menos liquidez

🏛️ **Tesouro Selic:**
✅ Garantia do Governo Federal
✅ Liquidez diária
✅ Acompanha a Selic
❌ Rentabilidade pode ser menor

🎯 **Recomendação:** Para reserva de emergência, Tesouro Selic. Para investimentos de médio prazo, CDB.
```

---

## 🔧 Troubleshooting

### Problema: QR Code não aparece
**Solução:** Verifique se o Puppeteer está instalado corretamente
```bash
npm install puppeteer --save
```

### Problema: Erro de API Gemini
**Solução:** Verifique se a chave está correta no `.env`
```bash
# Teste a chave em: https://makersuite.google.com/app/apikey
```

### Problema: Bot não responde
**Solução:** Verifique se o número está correto
- Formato: `5582987170503@c.us`
- Apenas este número pode usar o bot

### Problema: Erro de dependências
**Solução:** Reinstale as dependências
```bash
npm install
```

---

## 📊 Monitoramento

### Logs do Sistema
O assistente gera logs detalhados:
```
[2024-01-20 10:30:15] Cliente conectado!
[2024-01-20 10:31:22] Mensagem recebida de: 5582987170503@c.us
[2024-01-20 10:31:23] Resposta enviada com sucesso
```

### Métricas Importantes
- Tempo de resposta da IA
- Número de mensagens processadas
- Erros de API
- Status da conexão WhatsApp

---

## 🛡️ Segurança

### Dados Protegidos
- ✅ Apenas 1 número autorizado
- ✅ Não armazena conversas
- ✅ API Gemini criptografada
- ✅ Logs locais apenas

### Boas Práticas
- 🔐 Mantenha a chave da API segura
- 🔄 Reinicie o bot diariamente
- 📱 Use apenas em rede confiável
- 🚫 Não compartilhe o número autorizado

---

## 🚀 Próximos Passos

1. **Teste as funcionalidades básicas**
2. **Configure alertas de monitoramento**
3. **Personalize as respostas da IA**
4. **Adicione mais calculadoras se necessário**

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do sistema
2. Consulte a documentação técnica
3. Teste com o script `teste-assistente.js`

**Arquivo de teste:**
```bash
node teste-assistente.js
```

---

*Assistente Financeiro v1.0 - Desenvolvido com WhatsApp Web.js + Google Gemini*