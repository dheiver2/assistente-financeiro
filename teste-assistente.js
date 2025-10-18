/**
 * Script de Teste do Assistente Financeiro
 * Demonstra as funcionalidades sem necessidade de WhatsApp
 */

const CalculadorasFinanceiras = require('./calculadoras-financeiras');

console.log('🧮 TESTE DAS CALCULADORAS FINANCEIRAS\n');

// Teste 1: Juros Compostos
console.log('📊 1. JUROS COMPOSTOS');
console.log('Investimento: R$ 1.000 a 1% ao mês por 12 meses');
const juros = CalculadorasFinanceiras.jurosCompostos(1000, 0.01, 12);
console.log(`Capital inicial: ${juros.formatado.capital}`);
console.log(`Montante final: ${juros.formatado.montante}`);
console.log(`Juros ganhos: ${juros.formatado.juros}`);
console.log(`Rentabilidade: ${juros.formatado.rentabilidade}\n`);

// Teste 2: Aposentadoria
console.log('🏖️ 2. PLANEJAMENTO DE APOSENTADORIA');
console.log('Idade atual: 30 anos, aposentar aos 60, gastar R$ 5.000/mês');
const aposentadoria = CalculadorasFinanceiras.aposentadoria(30, 60, 5000, 0.10);
console.log(`Anos para aposentar: ${aposentadoria.anosParaAposentar}`);
console.log(`Valor necessário: ${aposentadoria.formatado.valorNecessario}`);
console.log(`Investir mensalmente: ${aposentadoria.formatado.valorMensal}`);
console.log(`Taxa anual esperada: ${aposentadoria.formatado.taxaAnual}\n`);

// Teste 3: Financiamento SAC
console.log('🏠 3. FINANCIAMENTO SAC');
console.log('Casa de R$ 300.000, taxa 8% ao ano, 20 anos');
const sac = CalculadorasFinanceiras.financiamentoSAC(300000, 0.08, 20);
console.log(`Primeira prestação: ${sac.formatado.primeiraPrestacao}`);
console.log(`Última prestação: ${sac.formatado.ultimaPrestacao}`);
console.log(`Total de juros: ${sac.formatado.totalJuros}`);
console.log(`Total pago: ${sac.formatado.totalPago}\n`);

// Teste 4: Financiamento PRICE
console.log('🏠 4. FINANCIAMENTO PRICE');
console.log('Casa de R$ 300.000, taxa 8% ao ano, 20 anos');
const price = CalculadorasFinanceiras.financiamentoPRICE(300000, 0.08, 20);
console.log(`Prestação fixa: ${price.formatado.prestacaoFixa}`);
console.log(`Total de juros: ${price.formatado.totalJuros}`);
console.log(`Total pago: ${price.formatado.totalPago}\n`);

// Teste 5: Inflação
console.log('📉 5. IMPACTO DA INFLAÇÃO');
console.log('R$ 10.000 hoje com inflação de 4% ao ano em 10 anos');
const inflacao = CalculadorasFinanceiras.inflacao(10000, 0.04, 10);
console.log(`Valor atual: ${inflacao.formatado.valorAtual}`);
console.log(`Valor futuro (poder de compra): ${inflacao.formatado.valorFuturo}`);
console.log(`Perda de poder: ${inflacao.formatado.perdaPoder}`);
console.log(`Percentual de perda: ${inflacao.formatado.percentualPerda}\n`);

// Teste 6: Regra dos 72
console.log('⏰ 6. REGRA DOS 72');
console.log('Tempo para dobrar investimento com 8% ao ano');
const regra72 = CalculadorasFinanceiras.regraDos72(0.08);
console.log(`Taxa: ${regra72.formatado.taxa}`);
console.log(`Tempo para dobrar: ${regra72.formatado.anosParaDobrar}\n`);

// Teste 7: Comparação de Investimentos
console.log('⚖️ 7. COMPARAÇÃO DE INVESTIMENTOS');
const investimentos = [
    { nome: 'Poupança', valor: 10000, taxa: 0.005, periodo: 12 },
    { nome: 'CDB', valor: 10000, taxa: 0.008, periodo: 12 },
    { nome: 'Tesouro Selic', valor: 10000, taxa: 0.009, periodo: 12 },
    { nome: 'Fundo DI', valor: 10000, taxa: 0.007, periodo: 12 }
];

const comparacao = CalculadorasFinanceiras.compararInvestimentos(investimentos);
console.log('Ranking de rentabilidade:');
comparacao.investimentos.forEach((inv, index) => {
    console.log(`${index + 1}º ${inv.nome}: ${inv.formatado.montante} (${inv.formatado.rentabilidade})`);
});

console.log(`\n🏆 Melhor opção: ${comparacao.melhorOpcao.nome}`);
console.log(`📉 Pior opção: ${comparacao.piorOpcao.nome}\n`);

// Simulação de prompt para IA
console.log('🤖 EXEMPLO DE PROMPT PARA IA GEMINI\n');

const exemploPrompt = `
PERGUNTA DO USUÁRIO: "Tenho R$ 50.000 para investir. Qual a melhor estratégia?"

RESPOSTA SUGERIDA:
💰 **Estratégia de Investimento para R$ 50.000**

📊 **Análise do seu perfil:**
- Valor disponível: R$ 50.000
- Recomendo diversificação por segurança

🎯 **Sugestão de alocação:**
• 40% Renda Fixa (R$ 20.000)
  - Tesouro Selic ou CDB
  - Liquidez e segurança
  
• 30% Fundos de Investimento (R$ 15.000)
  - Fundos DI ou multimercado
  - Gestão profissional
  
• 20% Ações/ETFs (R$ 10.000)
  - Diversificação em índices
  - Potencial de crescimento
  
• 10% Reserva de Emergência (R$ 5.000)
  - Poupança ou conta remunerada
  - Acesso imediato

⚠️ **Importante:**
- Avalie seu perfil de risco
- Considere seus objetivos e prazo
- Consulte um assessor de investimentos

💡 **Próximo passo:**
Que tal me contar mais sobre seus objetivos? Aposentadoria, casa própria, ou outro sonho?
`;

console.log(exemploPrompt);

console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
console.log('📱 Para usar o assistente real, execute: node assistente-financeiro.js');
console.log('🔑 Lembre-se de configurar a GEMINI_API_KEY no arquivo .env');