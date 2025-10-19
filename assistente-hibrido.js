/**
 * Assistente Financeiro Híbrido - Versão Produção
 * Funciona tanto como API REST quanto no WhatsApp
 * Otimizado para deploy em nuvem (Railway)
 */

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Configurações
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED !== 'false';

// Validação da chave da API
if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não encontrada nas variáveis de ambiente');
    process.exit(1);
}

// Inicialização do Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Estado global
let whatsappClient = null;
let whatsappReady = false;
let qrCodeData = null;

// Configuração do Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// ==================== FUNÇÕES DE CÁLCULO FINANCEIRO ====================

function calcularJurosSimples({ capital, taxa, tempo }) {
    if (!capital || !taxa || !tempo) {
        throw new Error('Capital, taxa e tempo são obrigatórios');
    }
    
    const juros = capital * (taxa / 100) * tempo;
    const montante = capital + juros;
    
    return {
        capital: parseFloat(capital),
        taxa: parseFloat(taxa),
        tempo: parseFloat(tempo),
        juros: parseFloat(juros.toFixed(2)),
        montante: parseFloat(montante.toFixed(2)),
        formula: 'J = C × i × t'
    };
}

function calcularJurosCompostos({ capital, taxa, tempo }) {
    if (!capital || !taxa || !tempo) {
        throw new Error('Capital, taxa e tempo são obrigatórios');
    }
    
    const montante = capital * Math.pow(1 + (taxa / 100), tempo);
    const juros = montante - capital;
    
    return {
        capital: parseFloat(capital),
        taxa: parseFloat(taxa),
        tempo: parseFloat(tempo),
        juros: parseFloat(juros.toFixed(2)),
        montante: parseFloat(montante.toFixed(2)),
        formula: 'M = C × (1 + i)^t'
    };
}

function calcularFinanciamento({ valor, taxa, parcelas }) {
    if (!valor || !taxa || !parcelas) {
        throw new Error('Valor, taxa e número de parcelas são obrigatórios');
    }
    
    const taxaMensal = taxa / 100;
    const prestacao = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / 
                     (Math.pow(1 + taxaMensal, parcelas) - 1);
    const totalPago = prestacao * parcelas;
    const totalJuros = totalPago - valor;
    
    return {
        valor_financiado: parseFloat(valor),
        taxa_mensal: parseFloat(taxa),
        numero_parcelas: parseInt(parcelas),
        valor_prestacao: parseFloat(prestacao.toFixed(2)),
        total_pago: parseFloat(totalPago.toFixed(2)),
        total_juros: parseFloat(totalJuros.toFixed(2)),
        formula: 'PMT = PV × [(i × (1+i)^n) / ((1+i)^n - 1)]'
    };
}

// ==================== FUNÇÕES DE IA ====================

async function processarConsultaFinanceira(pergunta) {
    try {
        const prompt = `
Você é um assistente financeiro especializado. Responda de forma clara e didática.

Pergunta: ${pergunta}

Forneça uma resposta completa incluindo:
1. Explicação conceitual
2. Fórmulas relevantes (se aplicável)
3. Exemplo prático
4. Dicas importantes

Mantenha a resposta focada e útil.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Erro ao processar consulta:', error);
        throw error;
    }
}

// ==================== ENDPOINTS API REST ====================

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Assistente Financeiro Híbrido',
        version: '2.0.0',
        whatsapp_enabled: WHATSAPP_ENABLED,
        whatsapp_ready: whatsappReady,
        has_qr_code: !!qrCodeData
    });
});

// Status do WhatsApp
app.get('/whatsapp/status', (req, res) => {
    res.json({
        enabled: WHATSAPP_ENABLED,
        ready: whatsappReady,
        has_qr_code: !!qrCodeData,
        qr_code: qrCodeData || null
    });
});

// Endpoint principal para consultas financeiras
app.post('/consulta', async (req, res) => {
    try {
        const { pergunta } = req.body;
        
        if (!pergunta) {
            return res.status(400).json({
                error: 'Pergunta é obrigatória',
                example: { pergunta: 'Como calcular juros compostos?' }
            });
        }

        const resposta = await processarConsultaFinanceira(pergunta);

        res.json({
            pergunta,
            resposta,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao processar consulta:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Endpoint para cálculos financeiros específicos
app.post('/calculo/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;
        const dados = req.body;

        let resultado;
        
        switch (tipo) {
            case 'juros-simples':
                resultado = calcularJurosSimples(dados);
                break;
            case 'juros-compostos':
                resultado = calcularJurosCompostos(dados);
                break;
            case 'financiamento':
                resultado = calcularFinanciamento(dados);
                break;
            default:
                return res.status(400).json({
                    error: 'Tipo de cálculo não suportado',
                    tipos_disponiveis: ['juros-simples', 'juros-compostos', 'financiamento']
                });
        }

        res.json({
            tipo,
            dados,
            resultado,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro no cálculo:', error);
        res.status(500).json({
            error: 'Erro no cálculo',
            message: error.message
        });
    }
});

// Endpoint de documentação
app.get('/', (req, res) => {
    res.json({
        service: 'Assistente Financeiro Híbrido',
        version: '2.0.0',
        whatsapp_enabled: WHATSAPP_ENABLED,
        whatsapp_ready: whatsappReady,
        endpoints: {
            'GET /health': 'Health check do serviço',
            'GET /whatsapp/status': 'Status da conexão WhatsApp',
            'POST /consulta': 'Consulta geral ao assistente financeiro',
            'POST /calculo/juros-simples': 'Cálculo de juros simples',
            'POST /calculo/juros-compostos': 'Cálculo de juros compostos',
            'POST /calculo/financiamento': 'Cálculo de financiamento'
        },
        examples: {
            consulta: {
                method: 'POST',
                url: '/consulta',
                body: { pergunta: 'Como funciona o CDI?' }
            },
            juros_simples: {
                method: 'POST',
                url: '/calculo/juros-simples',
                body: { capital: 1000, taxa: 5, tempo: 12 }
            }
        }
    });
});

// ==================== CONFIGURAÇÃO WHATSAPP ====================

async function inicializarWhatsApp() {
    if (!WHATSAPP_ENABLED) {
        console.log('📱 WhatsApp desabilitado via variável de ambiente');
        return;
    }

    try {
        console.log('📱 Inicializando cliente WhatsApp...');
        
        whatsappClient = new Client({
            authStrategy: new LocalAuth({
                clientId: 'assistente-financeiro-hibrido'
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--no-pings',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            }
        });

        // Event listeners
        whatsappClient.on('qr', (qr) => {
            console.log('📱 QR Code gerado para autenticação WhatsApp');
            qrCodeData = qr;
            qrcode.generate(qr, { small: true });
            console.log('🔗 QR Code disponível em: GET /whatsapp/status');
        });

        whatsappClient.on('ready', () => {
            console.log('✅ WhatsApp conectado e pronto!');
            whatsappReady = true;
            qrCodeData = null;
        });

        whatsappClient.on('authenticated', () => {
            console.log('🔐 WhatsApp autenticado com sucesso!');
        });

        whatsappClient.on('auth_failure', (msg) => {
            console.error('❌ Falha na autenticação WhatsApp:', msg);
            whatsappReady = false;
        });

        whatsappClient.on('disconnected', (reason) => {
            console.log('📱 WhatsApp desconectado:', reason);
            whatsappReady = false;
        });

        // Handler de mensagens
        whatsappClient.on('message', async (message) => {
            try {
                // Ignorar mensagens de grupos
                if (message.from.includes('@g.us')) {
                    return;
                }

                // Ignorar mensagens próprias
                if (message.fromMe) {
                    return;
                }

                console.log(`💬 Mensagem recebida de ${message.from}: ${message.body}`);

                // Processar mensagem
                const resposta = await processarMensagemWhatsApp(message.body);
                
                // Enviar resposta
                await message.reply(resposta);
                console.log(`✅ Resposta enviada para ${message.from}`);

            } catch (error) {
                console.error('❌ Erro ao processar mensagem WhatsApp:', error);
                await message.reply('❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.');
            }
        });

        // Inicializar cliente
        await whatsappClient.initialize();

    } catch (error) {
        console.error('❌ Erro ao inicializar WhatsApp:', error);
        whatsappReady = false;
    }
}

async function processarMensagemWhatsApp(mensagem) {
    try {
        // Detectar tipo de consulta
        const mensagemLower = mensagem.toLowerCase();
        
        // Comandos especiais
        if (mensagemLower.includes('/help') || mensagemLower.includes('/ajuda')) {
            return `🤖 *Assistente Financeiro*

*Comandos disponíveis:*
• Faça perguntas sobre finanças
• /juros [capital] [taxa] [tempo] - Juros simples
• /compostos [capital] [taxa] [tempo] - Juros compostos
• /financiamento [valor] [taxa] [parcelas]

*Exemplos:*
• "Como investir em renda fixa?"
• "/juros 1000 5 12"
• "/compostos 1000 5 12"
• "/financiamento 100000 1.5 60"`;
        }

        // Cálculos específicos
        if (mensagemLower.startsWith('/juros ')) {
            const params = mensagem.split(' ').slice(1);
            if (params.length >= 3) {
                const resultado = calcularJurosSimples({
                    capital: parseFloat(params[0]),
                    taxa: parseFloat(params[1]),
                    tempo: parseFloat(params[2])
                });
                return `💰 *Juros Simples*

Capital: R$ ${resultado.capital.toLocaleString('pt-BR')}
Taxa: ${resultado.taxa}% ao período
Tempo: ${resultado.tempo} períodos

*Resultado:*
Juros: R$ ${resultado.juros.toLocaleString('pt-BR')}
Montante: R$ ${resultado.montante.toLocaleString('pt-BR')}

Fórmula: ${resultado.formula}`;
            }
        }

        if (mensagemLower.startsWith('/compostos ')) {
            const params = mensagem.split(' ').slice(1);
            if (params.length >= 3) {
                const resultado = calcularJurosCompostos({
                    capital: parseFloat(params[0]),
                    taxa: parseFloat(params[1]),
                    tempo: parseFloat(params[2])
                });
                return `📈 *Juros Compostos*

Capital: R$ ${resultado.capital.toLocaleString('pt-BR')}
Taxa: ${resultado.taxa}% ao período
Tempo: ${resultado.tempo} períodos

*Resultado:*
Juros: R$ ${resultado.juros.toLocaleString('pt-BR')}
Montante: R$ ${resultado.montante.toLocaleString('pt-BR')}

Fórmula: ${resultado.formula}`;
            }
        }

        if (mensagemLower.startsWith('/financiamento ')) {
            const params = mensagem.split(' ').slice(1);
            if (params.length >= 3) {
                const resultado = calcularFinanciamento({
                    valor: parseFloat(params[0]),
                    taxa: parseFloat(params[1]),
                    parcelas: parseInt(params[2])
                });
                return `🏠 *Financiamento*

Valor: R$ ${resultado.valor_financiado.toLocaleString('pt-BR')}
Taxa: ${resultado.taxa_mensal}% ao mês
Parcelas: ${resultado.numero_parcelas}x

*Resultado:*
Prestação: R$ ${resultado.valor_prestacao.toLocaleString('pt-BR')}
Total Pago: R$ ${resultado.total_pago.toLocaleString('pt-BR')}
Total Juros: R$ ${resultado.total_juros.toLocaleString('pt-BR')}

Fórmula: ${resultado.formula}`;
            }
        }

        // Consulta geral com IA
        const resposta = await processarConsultaFinanceira(mensagem);
        return `🤖 *Assistente Financeiro*\n\n${resposta}\n\n_Digite /help para ver mais comandos_`;

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        return '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente ou digite /help para ver os comandos disponíveis.';
    }
}

// ==================== INICIALIZAÇÃO DO SERVIDOR ====================

async function iniciarServidor() {
    try {
        // Teste da conexão com Gemini
        console.log('🔍 Testando conexão com Gemini...');
        const testResult = await model.generateContent('Teste de conexão');
        console.log('✅ Conexão com Gemini estabelecida');

        // Inicializar WhatsApp (se habilitado)
        if (WHATSAPP_ENABLED) {
            await inicializarWhatsApp();
        }

        // Iniciar servidor Express
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 Assistente Financeiro Híbrido iniciado!');
            console.log(`📡 Servidor rodando na porta ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 Documentação: http://localhost:${PORT}/`);
            console.log(`📱 WhatsApp: ${WHATSAPP_ENABLED ? 'Habilitado' : 'Desabilitado'}`);
            console.log('✅ Serviço pronto para receber requisições');
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de sinais do sistema
process.on('SIGTERM', async () => {
    console.log('🛑 Recebido SIGTERM, encerrando servidor...');
    if (whatsappClient) {
        await whatsappClient.destroy();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Recebido SIGINT, encerrando servidor...');
    if (whatsappClient) {
        await whatsappClient.destroy();
    }
    process.exit(0);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Iniciar aplicação
iniciarServidor().catch(error => {
    console.error('💥 Falha crítica na inicialização:', error);
    process.exit(1);
});