/**
 * Assistente Financeiro Híbrido - Versão Baileys
 * API REST + WhatsApp usando Baileys (leve para Railway)
 * Otimizado para deploy em nuvem sem Puppeteer
 */

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
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
let whatsappSocket = null;
let whatsappReady = false;
let qrCodeData = null;
let authState = null;

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
        return res.sendStatus(200);
    }
    next();
});

// Funções de cálculo financeiro
function calcularJurosSimples({ capital, taxa, tempo }) {
    const juros = capital * (taxa / 100) * tempo;
    const montante = capital + juros;
    
    return {
        capital: parseFloat(capital),
        taxa: parseFloat(taxa),
        tempo: parseInt(tempo),
        juros: parseFloat(juros.toFixed(2)),
        montante: parseFloat(montante.toFixed(2))
    };
}

function calcularJurosCompostos({ capital, taxa, tempo }) {
    const montante = capital * Math.pow(1 + (taxa / 100), tempo);
    const juros = montante - capital;
    
    return {
        capital: parseFloat(capital),
        taxa: parseFloat(taxa),
        tempo: parseInt(tempo),
        juros: parseFloat(juros.toFixed(2)),
        montante: parseFloat(montante.toFixed(2))
    };
}

function calcularFinanciamento({ valor, taxa, parcelas }) {
    const taxaMensal = taxa / 100;
    const valorParcela = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / 
                        (Math.pow(1 + taxaMensal, parcelas) - 1);
    const valorTotal = valorParcela * parcelas;
    const jurosTotal = valorTotal - valor;
    
    return {
        valorFinanciado: parseFloat(valor),
        taxaJuros: parseFloat(taxa),
        numeroParcelas: parseInt(parcelas),
        valorParcela: parseFloat(valorParcela.toFixed(2)),
        valorTotal: parseFloat(valorTotal.toFixed(2)),
        jurosTotal: parseFloat(jurosTotal.toFixed(2))
    };
}

// Função para processar consultas financeiras
async function processarConsultaFinanceira(pergunta) {
    try {
        const prompt = `Você é um assistente financeiro especializado. Responda de forma clara e didática sobre: ${pergunta}
        
        Forneça informações práticas e educativas sobre finanças pessoais, investimentos, economia doméstica, etc.
        Mantenha a resposta concisa (máximo 200 palavras) e use linguagem acessível.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Erro ao processar consulta:', error);
        return 'Desculpe, ocorreu um erro ao processar sua consulta. Tente novamente.';
    }
}

// Rotas da API REST

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        whatsapp: whatsappReady ? 'connected' : 'disconnected',
        gemini: 'connected'
    });
});

// Status do WhatsApp
app.get('/whatsapp/status', (req, res) => {
    res.json({
        enabled: WHATSAPP_ENABLED,
        ready: whatsappReady,
        qrCode: qrCodeData
    });
});

// QR Code para autenticação
app.get('/whatsapp/qr', async (req, res) => {
    if (!qrCodeData) {
        return res.status(404).json({ error: 'QR Code não disponível' });
    }
    
    try {
        const qrImage = await QRCode.toDataURL(qrCodeData);
        res.json({ qrCode: qrImage, raw: qrCodeData });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar QR Code' });
    }
});

// Consulta financeira via API
app.post('/consulta', async (req, res) => {
    try {
        const { pergunta } = req.body;
        
        if (!pergunta) {
            return res.status(400).json({ 
                error: 'Pergunta é obrigatória',
                exemplo: { pergunta: 'Como investir na poupança?' }
            });
        }
        
        const resposta = await processarConsultaFinanceira(pergunta);
        
        res.json({
            pergunta,
            resposta,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Cálculos financeiros via API
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
                return res.status(400).json({ error: 'Tipo de cálculo inválido' });
        }
        
        res.json({
            tipo,
            dados,
            resultado,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro no cálculo:', error);
        res.status(500).json({ error: 'Erro no cálculo' });
    }
});

// Página inicial
app.get('/', (req, res) => {
    res.json({
        nome: 'Assistente Financeiro Híbrido',
        versao: '3.0.0-baileys',
        tecnologia: 'Baileys + Gemini AI',
        whatsapp: WHATSAPP_ENABLED ? 'habilitado' : 'desabilitado',
        endpoints: {
            health: '/health',
            consulta: 'POST /consulta',
            calculos: 'POST /calculo/{tipo}',
            whatsapp_status: '/whatsapp/status',
            whatsapp_qr: '/whatsapp/qr'
        }
    });
});

// Inicialização do WhatsApp com Baileys
async function inicializarWhatsApp() {
    if (!WHATSAPP_ENABLED) {
        console.log('📱 WhatsApp: Desabilitado');
        return;
    }
    
    try {
        console.log('🔄 Inicializando WhatsApp com Baileys...');
        
        // Configurar autenticação
        const authDir = './baileys_auth';
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }
        
        const { state, saveCreds } = await useMultiFileAuthState(authDir);
        authState = { state, saveCreds };
        
        // Criar socket do WhatsApp
        whatsappSocket = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: {
                level: 'silent',
                child: () => ({ level: 'silent' })
            }
        });
        
        // Eventos do WhatsApp
        whatsappSocket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('📱 QR Code gerado para WhatsApp');
                qrCodeData = qr;
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('📱 WhatsApp desconectado:', lastDisconnect?.error, 'Reconectando:', shouldReconnect);
                
                whatsappReady = false;
                qrCodeData = null;
                
                if (shouldReconnect) {
                    setTimeout(() => inicializarWhatsApp(), 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ WhatsApp conectado com sucesso!');
                whatsappReady = true;
                qrCodeData = null;
            }
        });
        
        whatsappSocket.ev.on('creds.update', authState.saveCreds);
        
        // Processar mensagens recebidas
        whatsappSocket.ev.on('messages.upsert', async (m) => {
            const message = m.messages[0];
            if (!message.key.fromMe && m.type === 'notify') {
                await processarMensagemWhatsApp(message);
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao inicializar WhatsApp:', error);
        whatsappReady = false;
    }
}

// Processar mensagens do WhatsApp
async function processarMensagemWhatsApp(message) {
    try {
        const from = message.key.remoteJid;
        const messageText = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || '';
        
        if (!messageText) return;
        
        console.log(`📱 Mensagem recebida de ${from}: ${messageText}`);
        
        // Verificar se é comando de cálculo
        if (messageText.toLowerCase().includes('calcular') || 
            messageText.toLowerCase().includes('juros') ||
            messageText.toLowerCase().includes('financiamento')) {
            
            const resposta = await processarConsultaFinanceira(messageText);
            await whatsappSocket.sendMessage(from, { text: resposta });
            
        } else if (messageText.toLowerCase().includes('ajuda') || 
                   messageText.toLowerCase().includes('help')) {
            
            const ajuda = `🤖 *Assistente Financeiro*\n\n` +
                         `Posso te ajudar com:\n` +
                         `• Consultas sobre investimentos\n` +
                         `• Cálculos de juros\n` +
                         `• Dicas de economia\n` +
                         `• Planejamento financeiro\n\n` +
                         `Exemplo: "Como calcular juros compostos?"`;
            
            await whatsappSocket.sendMessage(from, { text: ajuda });
            
        } else {
            // Consulta geral
            const resposta = await processarConsultaFinanceira(messageText);
            await whatsappSocket.sendMessage(from, { text: resposta });
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem WhatsApp:', error);
    }
}

// Inicialização do servidor
async function iniciarServidor() {
    try {
        console.log('🚀 Assistente Financeiro Híbrido iniciando...');
        console.log('📊 Ambiente:', process.env.NODE_ENV || 'development');
        console.log('🤖 Gemini AI: Conectado');
        
        // Inicializar Gemini AI
        console.log('✅ Gemini AI inicializado com sucesso');
        
        // Inicializar WhatsApp se habilitado
        if (WHATSAPP_ENABLED) {
            await inicializarWhatsApp();
        } else {
            console.log('📱 WhatsApp: Desabilitado');
        }
        
        // Iniciar servidor Express
        app.listen(PORT, () => {
            console.log(`🌐 Servidor rodando na porta ${PORT}`);
            console.log(`🔗 Acesse: http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Handlers de processo
process.on('SIGTERM', async () => {
    console.log('🔄 Recebido SIGTERM, encerrando graciosamente...');
    if (whatsappSocket) {
        await whatsappSocket.logout();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Recebido SIGINT, encerrando graciosamente...');
    if (whatsappSocket) {
        await whatsappSocket.logout();
    }
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Iniciar aplicação
iniciarServidor().catch(error => {
    console.error('❌ Falha fatal ao iniciar:', error);
    process.exit(1);
});