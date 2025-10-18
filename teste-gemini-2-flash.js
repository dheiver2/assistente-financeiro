const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Teste do modelo Gemini 2.0 Flash
 * Verifica se o modelo está funcionando corretamente
 */

async function testarGemini2Flash() {
    try {
        console.log('🧪 Testando modelo Gemini 2.0 Flash...');
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
        });

        console.log(`📋 Modelo configurado: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'}`);

        // Teste 1: Pergunta simples
        console.log('\n🔍 Teste 1: Pergunta simples sobre finanças...');
        const prompt1 = "Explique em uma frase o que é inflação.";
        const result1 = await model.generateContent(prompt1);
        const response1 = await result1.response;
        console.log('✅ Resposta:', response1.text());

        // Teste 2: Cálculo financeiro
        console.log('\n🔍 Teste 2: Cálculo financeiro...');
        const prompt2 = "Se eu investir R$ 1000 por mês durante 12 meses a 1% ao mês, quanto terei no final?";
        const result2 = await model.generateContent(prompt2);
        const response2 = await result2.response;
        console.log('✅ Resposta:', response2.text());

        // Teste 3: Verificar capacidades do modelo
        console.log('\n🔍 Teste 3: Verificando capacidades...');
        const prompt3 = "Qual é a sua versão e principais melhorias em relação ao Gemini Pro?";
        const result3 = await model.generateContent(prompt3);
        const response3 = await result3.response;
        console.log('✅ Resposta:', response3.text());

        console.log('\n🎉 Todos os testes passaram! Gemini 2.0 Flash está funcionando corretamente.');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        
        if (error.message.includes('API_KEY')) {
            console.log('💡 Verifique se a GEMINI_API_KEY está configurada corretamente no .env');
        }
        
        if (error.message.includes('model')) {
            console.log('💡 Verifique se o modelo está disponível. Modelos disponíveis:');
            console.log('   - gemini-2.0-flash-exp (experimental)');
            console.log('   - gemini-1.5-flash');
            console.log('   - gemini-pro');
        }
    }
}

// Executar teste se chamado diretamente
if (require.main === module) {
    testarGemini2Flash();
}

module.exports = { testarGemini2Flash };