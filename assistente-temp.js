/**
 * Assistente Financeiro - Versão API Only (Temporária para Deploy)
 * Apenas API REST sem WhatsApp para teste inicial
 */

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configurações
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';

// Inicialização do Gemini (se disponível)
let model = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'test-key') {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        console.log('✅ Gemini AI inicializado com sucesso');
    } catch (error) {
        console.warn('⚠️ Erro ao inicializar Gemini:', error.message);
    }
}

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
function calcularJurosSimples(principal, taxa, tempo) {
    const juros = principal * (taxa / 100) * tempo;
    const montante = principal + juros;
    return {
        principal: parseFloat(principal),
        taxa: parseFloat(taxa),
        tempo: parseFloat(tempo),
        juros: parseFloat(juros.toFixed(2)),
        montante: parseFloat(montante.toFixed(2))
    };
}

function calcularJurosCompostos(principal, taxa, tempo) {
    const montante = principal * Math.pow(1 + (taxa / 100), tempo);
    const juros = montante - principal;
    return {
        principal: parseFloat(principal),
        taxa: parseFloat(taxa),
        tempo: parseFloat(tempo),
        juros: parseFloat(juros.toFixed(2)),
        montante: parseFloat(montante.toFixed(2))
    };
}

function calcularFinanciamento(valor, taxa, parcelas) {
    const taxaMensal = taxa / 100;
    const prestacao = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / (Math.pow(1 + taxaMensal, parcelas) - 1);
    const totalPago = prestacao * parcelas;
    const totalJuros = totalPago - valor;
    
    return {
        valorFinanciado: parseFloat(valor),
        taxaJuros: parseFloat(taxa),
        numeroParcelas: parseInt(parcelas),
        valorPrestacao: parseFloat(prestacao.toFixed(2)),
        totalPago: parseFloat(totalPago.toFixed(2)),
        totalJuros: parseFloat(totalJuros.toFixed(2))
    };
}

// Função para processar consultas com IA
async function processarConsultaIA(pergunta) {
    if (!model) {
        return "Serviço de IA temporariamente indisponível. Tente novamente mais tarde.";
    }

    try {
        const prompt = `Você é um assistente financeiro especializado. Responda de forma clara e didática sobre: ${pergunta}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Erro na consulta IA:', error);
        return "Erro ao processar consulta. Tente novamente.";
    }
}

// ENDPOINTS DA API

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Assistente Financeiro API',
        version: '2.0.0-temp',
        gemini: model ? 'connected' : 'disconnected'
    });
});

// Status do WhatsApp (sempre offline nesta versão)
app.get('/whatsapp/status', (req, res) => {
    res.json({
        connected: false,
        ready: false,
        message: 'WhatsApp desabilitado nesta versão temporária'
    });
});

// Consulta geral com IA
app.post('/consulta', async (req, res) => {
    try {
        const { pergunta } = req.body;
        
        if (!pergunta) {
            return res.status(400).json({
                erro: 'Pergunta é obrigatória',
                exemplo: { pergunta: 'Como funciona o CDI?' }
            });
        }

        const resposta = await processarConsultaIA(pergunta);
        
        res.json({
            pergunta,
            resposta,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Cálculos financeiros
app.post('/calculo/:tipo', (req, res) => {
    try {
        const { tipo } = req.params;
        const dados = req.body;

        let resultado;

        switch (tipo) {
            case 'juros-simples':
                const { principal, taxa, tempo } = dados;
                if (!principal || !taxa || !tempo) {
                    return res.status(400).json({
                        erro: 'Parâmetros obrigatórios: principal, taxa, tempo',
                        exemplo: { principal: 1000, taxa: 5, tempo: 12 }
                    });
                }
                resultado = calcularJurosSimples(principal, taxa, tempo);
                break;

            case 'juros-compostos':
                const { principal: p2, taxa: t2, tempo: tm2 } = dados;
                if (!p2 || !t2 || !tm2) {
                    return res.status(400).json({
                        erro: 'Parâmetros obrigatórios: principal, taxa, tempo',
                        exemplo: { principal: 1000, taxa: 5, tempo: 12 }
                    });
                }
                resultado = calcularJurosCompostos(p2, t2, tm2);
                break;

            case 'financiamento':
                const { valor, taxa: t3, parcelas } = dados;
                if (!valor || !t3 || !parcelas) {
                    return res.status(400).json({
                        erro: 'Parâmetros obrigatórios: valor, taxa, parcelas',
                        exemplo: { valor: 100000, taxa: 1.5, parcelas: 60 }
                    });
                }
                resultado = calcularFinanciamento(valor, t3, parcelas);
                break;

            default:
                return res.status(400).json({
                    erro: 'Tipo de cálculo inválido',
                    tipos_disponiveis: ['juros-simples', 'juros-compostos', 'financiamento']
                });
        }

        res.json({
            tipo,
            entrada: dados,
            resultado,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro no cálculo:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Documentação da API
app.get('/', (req, res) => {
    res.json({
        service: 'Assistente Financeiro API (Temporário)',
        version: '2.0.0-temp',
        description: 'API REST para cálculos financeiros e consultas com IA',
        endpoints: [
            {
                method: 'GET',
                path: '/health',
                description: 'Verificação de saúde do serviço'
            },
            {
                method: 'GET',
                path: '/whatsapp/status',
                description: 'Status da conexão WhatsApp (sempre offline)'
            },
            {
                method: 'POST',
                path: '/consulta',
                description: 'Consulta geral com IA',
                body: { pergunta: 'string' }
            },
            {
                method: 'POST',
                path: '/calculo/juros-simples',
                description: 'Cálculo de juros simples',
                body: { principal: 'number', taxa: 'number', tempo: 'number' }
            },
            {
                method: 'POST',
                path: '/calculo/juros-compostos',
                description: 'Cálculo de juros compostos',
                body: { principal: 'number', taxa: 'number', tempo: 'number' }
            },
            {
                method: 'POST',
                path: '/calculo/financiamento',
                description: 'Cálculo de financiamento',
                body: { valor: 'number', taxa: 'number', parcelas: 'number' }
            }
        ],
        timestamp: new Date().toISOString()
    });
});

// Tratamento global de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        erro: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
});

// Inicialização do servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Assistente Financeiro API iniciado na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Gemini AI: ${model ? 'Conectado' : 'Desconectado'}`);
    console.log(`📱 WhatsApp: Desabilitado (versão temporária)`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
});

// Tratamento de sinais do sistema
process.on('SIGTERM', () => {
    console.log('🔄 Recebido SIGTERM, encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 Recebido SIGINT, encerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
    });
});

module.exports = app;