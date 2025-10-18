/**
 * Health Check para Railway.app
 * Verifica se o assistente financeiro está funcionando corretamente
 * Inclui servidor HTTP para endpoint /health
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class HealthCheck {
    constructor() {
        this.checks = [];
        this.status = 'unknown';
    }

    async runChecks() {
        console.log('🔍 Iniciando Health Check...');
        
        try {
            // Check 1: Verificar se o arquivo principal existe
            await this.checkMainFile();
            
            // Check 2: Verificar variáveis de ambiente
            await this.checkEnvironmentVariables();
            
            // Check 3: Verificar dependências críticas
            await this.checkDependencies();
            
            // Check 4: Verificar conectividade Gemini
            await this.checkGeminiConnection();
            
            this.status = 'healthy';
            console.log('✅ Health Check: HEALTHY');
            process.exit(0);
            
        } catch (error) {
            this.status = 'unhealthy';
            console.error('❌ Health Check: UNHEALTHY');
            console.error('Erro:', error.message);
            process.exit(1);
        }
    }

    async checkMainFile() {
        const mainFile = path.join(__dirname, 'assistente-financeiro.js');
        if (!fs.existsSync(mainFile)) {
            throw new Error('Arquivo principal assistente-financeiro.js não encontrado');
        }
        console.log('✅ Arquivo principal encontrado');
    }

    async checkEnvironmentVariables() {
        const requiredVars = ['GEMINI_API_KEY'];
        const missingVars = [];

        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                missingVars.push(varName);
            }
        }

        if (missingVars.length > 0) {
            throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`);
        }
        console.log('✅ Variáveis de ambiente configuradas');
    }

    async checkDependencies() {
        try {
            require('@google/generative-ai');
            require('puppeteer');
            require('moment');
            console.log('✅ Dependências críticas carregadas');
        } catch (error) {
            throw new Error(`Erro ao carregar dependências: ${error.message}`);
        }
    }

    async checkGeminiConnection() {
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
            });
            
            // Teste simples de conectividade
            const result = await model.generateContent('teste');
            console.log('✅ Conexão com Gemini funcionando');
        } catch (error) {
            throw new Error(`Erro na conexão com Gemini: ${error.message}`);
        }
    }

    getStatus() {
        return {
            status: this.status,
            timestamp: new Date().toISOString(),
            checks: this.checks
        };
    }
}

    // Criar servidor HTTP para endpoint /health
    createHealthServer(port = process.env.PORT || 3000) {
        const server = http.createServer((req, res) => {
            // Configurar CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            if (req.url === '/health' && req.method === 'GET') {
                this.handleHealthCheck(res);
            } else if (req.url === '/' && req.method === 'GET') {
                this.handleRoot(res);
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        });

        server.listen(port, () => {
            console.log(`🏥 Health Check Server rodando na porta ${port}`);
            console.log(`📊 Endpoint: http://localhost:${port}/health`);
        });

        return server;
    }

    async handleHealthCheck(res) {
        try {
            await this.runChecks();
            const status = this.getStatus();
            res.writeHead(200);
            res.end(JSON.stringify(status, null, 2));
        } catch (error) {
            const errorStatus = {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message,
                checks: this.checks
            };
            res.writeHead(503);
            res.end(JSON.stringify(errorStatus, null, 2));
        }
    }

    handleRoot(res) {
        const info = {
            service: 'Assistente Financeiro WhatsApp',
            version: '2.0.0',
            model: 'Gemini 2.0 Flash',
            platform: 'Railway.app',
            endpoints: {
                health: '/health',
                root: '/'
            },
            timestamp: new Date().toISOString()
        };
        res.writeHead(200);
        res.end(JSON.stringify(info, null, 2));
    }

    // Executar checks sem sair do processo (para servidor HTTP)
    async runChecksQuiet() {
        try {
            await this.checkMainFile();
            await this.checkEnvironmentVariables();
            await this.checkDependencies();
            await this.checkGeminiConnection();
            this.status = 'healthy';
            return true;
        } catch (error) {
            this.status = 'unhealthy';
            this.checks.push({
                name: 'general',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }
}

// Executar health check se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const healthCheck = new HealthCheck();
    
    if (args.includes('--server')) {
        // Modo servidor HTTP
        healthCheck.createHealthServer();
    } else {
        // Modo check único
        healthCheck.runChecks();
    }
}

module.exports = HealthCheck;