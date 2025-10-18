# 🏦 Assistente Financeiro Inteligente

Um assistente financeiro avançado que utiliza WhatsApp Web.js + Google Gemini AI para fornecer consultoria financeira personalizada.

## 🎯 Características Principais

- **IA Avançada**: Powered by Google Gemini Pro
- **Segurança**: Responde apenas para número autorizado (5582 87170503)
- **Especialização**: Focado em consultoria financeira brasileira
- **Interativo**: Comandos especiais e conversação natural
- **Profissional**: Respostas estruturadas com disclaimers apropriados

## 🚀 Configuração Rápida

### 1. Pré-requisitos
```bash
# Node.js 16+ instalado
# Conta Google para API Gemini
# WhatsApp ativo no celular
```

### 2. Configurar API Gemini
1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma nova API Key
3. Substitua `YOUR_GEMINI_API_KEY` no arquivo `.env`

### 3. Executar o Assistente
```bash
# Instalar dependências (já feito)
npm install @google/generative-ai dotenv

# Executar o assistente
node assistente-financeiro.js
```

### 4. Autenticação WhatsApp
1. Escaneie o QR Code que aparecerá no terminal
2. Aguarde a mensagem "Assistente Financeiro está online!"

## 📱 Como Usar

### Comandos Especiais
- `/start` ou `/inicio` - Mensagem de boas-vindas
- `/help` ou `/ajuda` - Menu de ajuda
- `/calculadora` - Ferramentas de cálculo
- `/dicas` - Dicas financeiras rápidas

### Exemplos de Perguntas
```
"Como investir R$ 5.000 com baixo risco?"
"Qual a melhor estratégia para quitar dívidas?"
"Como calcular juros compostos de R$ 1000 a 1% ao mês?"
"Preciso de ajuda com meu orçamento familiar"
"Como declarar imposto de renda de investimentos?"
```

## 🔧 Funcionalidades

### 💰 Planejamento Financeiro
- Orçamento familiar
- Controle de gastos
- Metas financeiras
- Reserva de emergência

### 📊 Investimentos
- Análise de perfil de risco
- Diversificação de carteira
- Renda fixa vs. variável
- Criptomoedas e fundos

### 🧮 Calculadoras
- Juros compostos
- Financiamentos (SAC/Price)
- Aposentadoria
- Inflação e poder de compra

### 📈 Educação Financeira
- Conceitos básicos
- Estratégias avançadas
- Dicas personalizadas
- Análise de cenários

## 🛡️ Segurança

### Número Autorizado
- **Único número autorizado**: 5582 87170503
- Mensagens de outros números são ignoradas
- Log de tentativas de acesso

### Proteções Implementadas
- Rate limiting (30 requests/minuto)
- Validação de entrada
- Disclaimers automáticos
- Não armazenamento de dados sensíveis

## 📋 Estrutura do Código

```
assistente-financeiro.js
├── AssistenteFinanceiro (Classe Principal)
├── inicializarEventos() - Eventos WhatsApp
├── processarMensagem() - Lógica principal
├── responderComIA() - Integração Gemini
├── processarComandosEspeciais() - Comandos
└── Métodos de utilidade
```

## 🔍 Monitoramento

### Logs Disponíveis
```bash
# Mensagens recebidas
💬 Mensagem recebida de 5582987170503@c.us: Como investir?

# Mensagens ignoradas
🚫 Mensagem ignorada de: 5511999999999@c.us

# Status do sistema
✅ Assistente Financeiro está online!
🔐 Autenticado com sucesso!
```

### Métricas Sugeridas
- Número de consultas por dia
- Tipos de perguntas mais frequentes
- Taxa de resposta da IA
- Tempo médio de resposta

## 🚨 Troubleshooting

### Problemas Comuns

**1. Erro de API Key**
```
❌ GEMINI_API_KEY não configurada no arquivo .env
```
**Solução**: Configurar a API key no arquivo `.env`

**2. Erro de Autenticação WhatsApp**
```
❌ Falha na autenticação
```
**Solução**: Deletar pasta `.wwebjs_auth` e reautenticar

**3. Puppeteer não inicia**
```
❌ Failed to launch the browser process!
```
**Solução**: Instalar dependências do Chrome ou usar modo headless

### Comandos de Diagnóstico
```bash
# Verificar dependências
npm list @google/generative-ai dotenv

# Testar API Gemini
node -e "console.log(process.env.GEMINI_API_KEY)"

# Limpar cache WhatsApp
rm -rf .wwebjs_auth
```

## 📊 Roadmap

### Versão Atual (1.0)
- ✅ Integração WhatsApp + Gemini
- ✅ Comandos básicos
- ✅ Filtro por número
- ✅ Calculadoras financeiras

### Próximas Versões
- 🔄 Dashboard web de monitoramento
- 🔄 Integração com APIs financeiras (B3, Banco Central)
- 🔄 Histórico de conversas
- 🔄 Relatórios personalizados
- 🔄 Notificações proativas

## 🤝 Contribuição

### Como Contribuir
1. Fork do repositório
2. Criar branch para feature
3. Implementar melhorias
4. Testes abrangentes
5. Pull request com documentação

### Áreas de Melhoria
- Novas calculadoras financeiras
- Integração com mais APIs
- Melhorias na IA
- Interface web
- Testes automatizados

## 📄 Licença

Este projeto utiliza a mesma licença do whatsapp-web.js (Apache-2.0).

## 📞 Suporte

Para dúvidas técnicas ou sugestões:
- Abra uma issue no repositório
- Documente o problema com logs
- Inclua versão do Node.js e sistema operacional

---

**⚠️ Disclaimer**: Este assistente fornece informações educacionais. Sempre consulte profissionais qualificados para decisões financeiras importantes.

**🤖 Powered by**: WhatsApp Web.js + Google Gemini AI