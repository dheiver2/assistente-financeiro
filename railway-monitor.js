/**
 * Monitor de Sistema para Railway.app
 * Coleta métricas e monitora saúde do assistente financeiro
 */

const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class RailwayMonitor {
    constructor() {
        this.metrics = {
            system: {},
            application: {},
            whatsapp: {},
            gemini: {}
        };
        this.alerts = [];
        this.startTime = Date.now();
    }

    // Coletar métricas do sistema
    async collectSystemMetrics() {
        try {
            const metrics = {
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: {
                    used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
                    total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
                    external: process.memoryUsage().external / 1024 / 1024, // MB
                    rss: process.memoryUsage().rss / 1024 / 1024, // MB
                    system_free: os.freemem() / 1024 / 1024, // MB
                    system_total: os.totalmem() / 1024 / 1024 // MB
                },
                cpu: {
                    usage: process.cpuUsage(),
                    load_avg: os.loadavg(),
                    cores: os.cpus().length
                },
                platform: {
                    type: os.type(),
                    platform: os.platform(),
                    arch: os.arch(),
                    release: os.release(),
                    hostname: os.hostname()
                },
                node: {
                    version: process.version,
                    pid: process.pid,
                    env: process.env.NODE_ENV || 'development'
                }
            };

            this.metrics.system = metrics;
            return metrics;
        } catch (error) {
            console.error('❌ Erro ao coletar métricas do sistema:', error.message);
            return null;
        }
    }

    // Verificar status da aplicação
    async checkApplicationStatus() {
        try {
            const status = {
                timestamp: new Date().toISOString(),
                process_id: process.pid,
                uptime_seconds: process.uptime(),
                uptime_human: this.formatUptime(process.uptime()),
                memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                environment: process.env.NODE_ENV || 'development',
                railway_env: !!process.env.RAILWAY_ENVIRONMENT,
                port: process.env.PORT || 'not_set'
            };

            // Verificar arquivos críticos
            const criticalFiles = [
                'assistente-financeiro.js',
                'calculadoras-financeiras.js',
                'package.json'
            ];

            status.files_status = {};
            for (const file of criticalFiles) {
                status.files_status[file] = fs.existsSync(file);
            }

            this.metrics.application = status;
            return status;
        } catch (error) {
            console.error('❌ Erro ao verificar status da aplicação:', error.message);
            return null;
        }
    }

    // Verificar conectividade Gemini
    async checkGeminiStatus() {
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY não configurada');
            }

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
            });

            const startTime = Date.now();
            const result = await model.generateContent('ping');
            const responseTime = Date.now() - startTime;

            const status = {
                timestamp: new Date().toISOString(),
                api_key_configured: !!process.env.GEMINI_API_KEY,
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
                response_time_ms: responseTime,
                status: 'connected',
                last_response: result.response.text().substring(0, 100)
            };

            this.metrics.gemini = status;
            return status;
        } catch (error) {
            const status = {
                timestamp: new Date().toISOString(),
                api_key_configured: !!process.env.GEMINI_API_KEY,
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
                status: 'error',
                error: error.message
            };

            this.metrics.gemini = status;
            return status;
        }
    }

    // Verificar status WhatsApp (se disponível)
    async checkWhatsAppStatus() {
        try {
            // Verificar se existe sessão salva
            const sessionPath = './.wwebjs_auth';
            const sessionExists = fs.existsSync(sessionPath);
            
            let sessionSize = 0;
            if (sessionExists) {
                try {
                    const stats = fs.statSync(sessionPath);
                    sessionSize = stats.size || 0;
                } catch (e) {
                    // Ignorar erro de stats
                }
            }

            const status = {
                timestamp: new Date().toISOString(),
                session_exists: sessionExists,
                session_size_bytes: sessionSize,
                session_name: process.env.WHATSAPP_SESSION_NAME || 'default',
                puppeteer_config: {
                    skip_download: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true',
                    executable_path: process.env.PUPPETEER_EXECUTABLE_PATH || 'default'
                }
            };

            this.metrics.whatsapp = status;
            return status;
        } catch (error) {
            const status = {
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error.message
            };

            this.metrics.whatsapp = status;
            return status;
        }
    }

    // Gerar relatório completo
    async generateReport() {
        console.log('📊 Coletando métricas do sistema...');
        
        await Promise.all([
            this.collectSystemMetrics(),
            this.checkApplicationStatus(),
            this.checkGeminiStatus(),
            this.checkWhatsAppStatus()
        ]);

        const report = {
            timestamp: new Date().toISOString(),
            service: 'Assistente Financeiro WhatsApp',
            platform: 'Railway.app',
            version: '2.0.0',
            metrics: this.metrics,
            alerts: this.generateAlerts(),
            summary: this.generateSummary()
        };

        return report;
    }

    // Gerar alertas baseados nas métricas
    generateAlerts() {
        const alerts = [];

        // Alert: Memória alta
        if (this.metrics.system.memory && this.metrics.system.memory.used > 500) {
            alerts.push({
                level: 'warning',
                type: 'memory',
                message: `Uso de memória alto: ${Math.round(this.metrics.system.memory.used)}MB`,
                timestamp: new Date().toISOString()
            });
        }

        // Alert: Gemini com erro
        if (this.metrics.gemini.status === 'error') {
            alerts.push({
                level: 'critical',
                type: 'gemini',
                message: `Gemini API com erro: ${this.metrics.gemini.error}`,
                timestamp: new Date().toISOString()
            });
        }

        // Alert: Sessão WhatsApp não existe
        if (this.metrics.whatsapp.session_exists === false) {
            alerts.push({
                level: 'info',
                type: 'whatsapp',
                message: 'Sessão WhatsApp não encontrada - primeira execução ou reset necessário',
                timestamp: new Date().toISOString()
            });
        }

        return alerts;
    }

    // Gerar resumo do status
    generateSummary() {
        const summary = {
            overall_status: 'healthy',
            components: {
                system: this.metrics.system ? 'healthy' : 'unknown',
                application: this.metrics.application ? 'healthy' : 'unknown',
                gemini: this.metrics.gemini?.status === 'connected' ? 'healthy' : 'unhealthy',
                whatsapp: this.metrics.whatsapp ? 'healthy' : 'unknown'
            },
            uptime: this.formatUptime(process.uptime()),
            memory_usage: this.metrics.system?.memory ? 
                `${Math.round(this.metrics.system.memory.used)}MB` : 'unknown'
        };

        // Determinar status geral
        if (summary.components.gemini === 'unhealthy') {
            summary.overall_status = 'degraded';
        }

        return summary;
    }

    // Formatar tempo de uptime
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m ${secs}s`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    // Salvar relatório em arquivo
    async saveReport(report, filename = null) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportFile = filename || `railway-monitor-${timestamp}.json`;
            
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            console.log(`📄 Relatório salvo: ${reportFile}`);
            return reportFile;
        } catch (error) {
            console.error('❌ Erro ao salvar relatório:', error.message);
            return null;
        }
    }

    // Exibir relatório no console
    displayReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RELATÓRIO DE MONITORAMENTO - RAILWAY.APP');
        console.log('='.repeat(60));
        
        console.log(`🕐 Timestamp: ${report.timestamp}`);
        console.log(`⚡ Status Geral: ${report.summary.overall_status.toUpperCase()}`);
        console.log(`⏱️  Uptime: ${report.summary.uptime}`);
        console.log(`💾 Memória: ${report.summary.memory_usage}`);
        
        console.log('\n📋 COMPONENTES:');
        Object.entries(report.summary.components).forEach(([component, status]) => {
            const icon = status === 'healthy' ? '✅' : status === 'unhealthy' ? '❌' : '⚠️';
            console.log(`  ${icon} ${component}: ${status}`);
        });

        if (report.alerts.length > 0) {
            console.log('\n🚨 ALERTAS:');
            report.alerts.forEach(alert => {
                const icon = alert.level === 'critical' ? '🔴' : 
                           alert.level === 'warning' ? '🟡' : '🔵';
                console.log(`  ${icon} [${alert.level.toUpperCase()}] ${alert.message}`);
            });
        }

        console.log('\n' + '='.repeat(60));
    }
}

// Executar monitor se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const monitor = new RailwayMonitor();

    if (args.includes('--watch')) {
        // Modo contínuo
        console.log('🔄 Iniciando monitoramento contínuo...');
        setInterval(async () => {
            const report = await monitor.generateReport();
            monitor.displayReport(report);
        }, 60000); // A cada 1 minuto
    } else {
        // Execução única
        monitor.generateReport().then(report => {
            monitor.displayReport(report);
            
            if (args.includes('--save')) {
                monitor.saveReport(report);
            }
        });
    }
}

module.exports = RailwayMonitor;