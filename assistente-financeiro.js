const { Client, LocalAuth } = require('./index');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Assistente Financeiro Inteligente
 * Utiliza WhatsApp Web.js + Google Gemini 2.0 Flash AI
 * Atende TODOS os números privados (exceto grupos)
 */

class AssistenteFinanceiro {
    constructor() {
        // Configuração do número do bot (usado para logs e identificação)
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
        });
        
        // Configuração do cliente WhatsApp
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'assistente-financeiro'
            }),
            puppeteer: { 
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.inicializarEventos();
        this.promptSistema = this.criarPromptSistema();
    }

    /**
     * Cria o prompt do sistema para o assistente financeiro
     */
    criarPromptSistema() {
        return `Você é um Assistente Financeiro Especializado com 15 anos de experiência em:

ESPECIALIDADES:
- Planejamento financeiro pessoal e empresarial
- Análise de investimentos (ações, fundos, renda fixa, criptomoedas)
- Controle de gastos e orçamento familiar
- Educação financeira e literacia
- Estratégias de economia e poupança
- Análise de crédito e financiamentos
- Impostos e declaração de renda
- Previdência e aposentadoria

DIRETRIZES DE RESPOSTA:
1. Seja sempre profissional, claro e didático
2. Forneça exemplos práticos e cálculos quando relevante
3. Inclua disclaimers sobre riscos quando necessário
4. Sugira próximos passos ou ações concretas
5. Use linguagem acessível, evitando jargões excessivos
6. Mantenha respostas concisas mas completas (máximo 500 palavras)

FORMATO DE RESPOSTA:
- Use emojis para organizar informações (💰 📊 📈 ⚠️ 💡)
- Estruture em tópicos quando apropriado
- Inclua cálculos simples quando solicitado
- Termine sempre com uma pergunta ou sugestão de próximo passo

LIMITAÇÕES:
- Não forneça conselhos de investimento específicos sem análise completa
- Sempre mencione que recomendações devem ser validadas com profissionais
- Não prometa retornos garantidos
- Mantenha-se atualizado com cenário econômico brasileiro

Responda sempre em português brasileiro, de forma amigável mas profissional.`;
    }

    /**
     * Inicializa os eventos do WhatsApp
     */
    inicializarEventos() {
        this.client.on('qr', (qr) => {
            console.log('🔗 QR Code recebido. Escaneie com seu WhatsApp:');
            console.log(qr);
        });

        this.client.on('ready', () => {
            console.log('✅ Assistente Financeiro está online!');
            console.log('📱 Atendendo: TODOS os números privados (exceto grupos)');
        });

        this.client.on('authenticated', () => {
            console.log('🔐 Autenticado com sucesso!');
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ Falha na autenticação:', msg);
        });

        this.client.on('message', async (message) => {
            await this.processarMensagem(message);
        });

        this.client.on('disconnected', (reason) => {
            console.log('🔌 Desconectado:', reason);
        });
    }

    /**
     * Processa mensagens recebidas
     */
    async processarMensagem(message) {
        try {
            // Ignora mensagens do próprio bot
            if (message.fromMe) return;

            // Verifica se é um número autorizado (privado)
            if (!this.isNumeroAutorizado(message.from)) {
                console.log(`🚫 Mensagem ignorada de: ${message.from}`);
                // Se for grupo, envia mensagem explicativa
                if (message.from.includes('@g.us')) {
                    await message.reply('💼 Olá! Atendo apenas conversas privadas para questões financeiras.');
                }
                return;
            }

            console.log(`💬 Mensagem recebida de ${message.from}: ${message.body}`);

            // Verifica comandos especiais
            if (await this.processarComandosEspeciais(message)) {
                return;
            }

            // Processa com IA Gemini
            await this.responderComIA(message);

        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
            await message.reply('⚠️ Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes.');
        }
    }

    /**
     * Verifica se o número está autorizado a usar o assistente
     * @param {string} numeroCompleto - Número no formato WhatsApp
     * @returns {boolean}
     */
    isNumeroAutorizado(numeroCompleto) {
        // Aceita qualquer número privado (não grupos)
        // Bloqueia apenas grupos (@g.us) e status (@broadcast)
        if (numeroCompleto.includes('@g.us') || numeroCompleto.includes('@broadcast')) {
            return false;
        }
        
        // Aceita todos os números privados (@c.us)
        return numeroCompleto.includes('@c.us');
    }

    /**
     * Processa comandos especiais
     */
    async processarComandosEspeciais(message) {
        const comando = message.body.toLowerCase().trim();

        switch (comando) {
            case '/start':
            case '/inicio':
                await this.enviarBoasVindas(message);
                return true;

            case '/help':
            case '/ajuda':
                await this.enviarAjuda(message);
                return true;

            case '/calculadora':
                await this.enviarCalculadora(message);
                return true;

            case '/dicas':
                await this.enviarDicasRapidas(message);
                return true;

            default:
                return false;
        }
    }

    /**
     * Envia mensagem de boas-vindas
     */
    async enviarBoasVindas(message) {
        const boasVindas = `🏦 *Assistente Financeiro Inteligente*

Olá! Sou seu assistente financeiro pessoal, especializado em:

💰 *Planejamento Financeiro*
📊 *Análise de Investimentos*
📈 *Controle de Gastos*
🎯 *Educação Financeira*
💡 *Estratégias de Economia*

*Comandos Disponíveis:*
• /ajuda - Lista de comandos
• /calculadora - Ferramentas de cálculo
• /dicas - Dicas financeiras rápidas

*Como usar:*
Envie suas dúvidas financeiras em linguagem natural. Exemplo:
"Como investir R$ 1000 com baixo risco?"
"Qual a melhor estratégia para quitar dívidas?"

Estou aqui para ajudar! 🚀`;

        await message.reply(boasVindas);
    }

    /**
     * Envia menu de ajuda
     */
    async enviarAjuda(message) {
        const ajuda = `📋 *Menu de Ajuda - Assistente Financeiro*

*🔧 Comandos Disponíveis:*
• /inicio - Mensagem de boas-vindas
• /ajuda - Este menu
• /calculadora - Ferramentas de cálculo
• /dicas - Dicas financeiras

*💬 Exemplos de Perguntas:*
• "Como fazer um orçamento familiar?"
• "Qual o melhor investimento para iniciantes?"
• "Como calcular juros compostos?"
• "Estratégias para sair das dívidas"
• "Como declarar imposto de renda?"

*⚡ Funcionalidades:*
✅ Análise financeira personalizada
✅ Cálculos automáticos
✅ Dicas de investimento
✅ Planejamento de orçamento
✅ Educação financeira

Envie sua dúvida e receba uma resposta especializada! 💼`;

        await message.reply(ajuda);
    }

    /**
     * Envia opções de calculadora
     */
    async enviarCalculadora(message) {
        const calculadora = `🧮 *Calculadoras Financeiras*

Envie sua solicitação de cálculo:

*📊 Disponíveis:*
• Juros compostos
• Financiamento (SAC/Price)
• Rendimento de investimentos
• Inflação e poder de compra
• Aposentadoria
• Valor presente/futuro

*💡 Exemplo de uso:*
"Calcule juros compostos de R$ 1000 a 1% ao mês por 12 meses"

"Quanto preciso investir mensalmente para ter R$ 100.000 em 10 anos com 10% ao ano?"

Qual cálculo você gostaria de fazer? 🤔`;

        await message.reply(calculadora);
    }

    /**
     * Envia dicas financeiras rápidas
     */
    async enviarDicasRapidas(message) {
        const dicas = [
            "💰 *Regra 50-30-20:* 50% necessidades, 30% desejos, 20% poupança",
            "📈 *Diversificação:* Nunca coloque todos os ovos na mesma cesta",
            "🎯 *Reserva de emergência:* 6 meses de gastos essenciais",
            "📊 *Renda fixa primeiro:* Construa base sólida antes de arriscar",
            "💡 *Educação financeira:* Invista em conhecimento primeiro",
            "⚡ *Automatize:* Configure investimentos automáticos",
            "🔍 *Compare sempre:* Taxas, tarifas e condições",
            "📱 *Controle gastos:* Use apps para monitorar despesas"
        ];

        const dicaAleatoria = dicas[Math.floor(Math.random() * dicas.length)];
        
        await message.reply(`💡 *Dica Financeira do Dia*\n\n${dicaAleatoria}\n\n_Quer mais dicas personalizadas? Envie sua situação financeira!_`);
    }

    /**
     * Responde usando IA Gemini
     */
    async responderComIA(message) {
        try {
            // Mostra que está digitando
            await message.reply('💭 Analisando sua questão financeira...');

            // Prepara o prompt completo
            const promptCompleto = `${this.promptSistema}

PERGUNTA DO USUÁRIO:
${message.body}

Responda de forma profissional e útil:`;

            // Gera resposta com Gemini
            const result = await this.model.generateContent(promptCompleto);
            const resposta = result.response.text();

            // Adiciona assinatura
            const respostaFinal = `${resposta}

---
🤖 *Assistente Financeiro IA*
_Dúvidas? Continue perguntando!_`;

            await message.reply(respostaFinal);

        } catch (error) {
            console.error('❌ Erro na IA:', error);
            await message.reply('⚠️ Desculpe, não consegui processar sua pergunta no momento. Tente reformular ou tente novamente.');
        }
    }

    /**
     * Inicia o assistente
     */
    async iniciar() {
        try {
            console.log('🚀 Iniciando Assistente Financeiro...');
            
            // Verifica se a API key do Gemini está configurada
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY não configurada no arquivo .env');
            }

            await this.client.initialize();
            
        } catch (error) {
            console.error('❌ Erro ao iniciar:', error);
            process.exit(1);
        }
    }
}

// Inicialização
if (require.main === module) {
    const assistente = new AssistenteFinanceiro();
    assistente.iniciar();
}

module.exports = AssistenteFinanceiro;