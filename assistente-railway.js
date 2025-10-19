/**
 * Assistente Financeiro - Versão Railway (Simplificada)
 * Versão otimizada para deploy no Railway sem dependências do Puppeteer
 */

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configurações
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validação da chave da API
if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY não encontrada nas variáveis de ambiente');
    process.exit(1);
}

// Inicialização do Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Configuração do Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Assistente Financeiro Railway',
        version: '1.0.0'
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
        const resposta = response.text();

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

// Funções de cálculo financeiro
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

// Endpoint de documentação
app.get('/', (req, res) => {
    res.json({
        service: 'Assistente Financeiro Railway',
        version: '1.0.0',
        endpoints: {
            'GET /health': 'Health check do serviço',
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

// Tratamento de erros global
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
    });
});

// Inicialização do servidor
async function iniciarServidor() {
    try {
        // Teste da conexão com Gemini
        console.log('🔍 Testando conexão com Gemini...');
        const testResult = await model.generateContent('Teste de conexão');
        console.log('✅ Conexão com Gemini estabelecida');

        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 Assistente Financeiro Railway iniciado!');
            console.log(`📡 Servidor rodando na porta ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 Documentação: http://localhost:${PORT}/`);
            console.log('✅ Serviço pronto para receber requisições');
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de sinais do sistema
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, encerrando servidor...');
    process.exit(0);
});

// Iniciar aplicação
iniciarServidor().catch(error => {
    console.error('💥 Falha crítica na inicialização:', error);
    process.exit(1);
});