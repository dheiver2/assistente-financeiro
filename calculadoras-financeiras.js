/**
 * Módulo de Calculadoras Financeiras
 * Funções especializadas para cálculos financeiros brasileiros
 */

class CalculadorasFinanceiras {
    
    /**
     * Calcula juros compostos
     * @param {number} capital - Valor inicial
     * @param {number} taxa - Taxa de juros (decimal, ex: 0.01 para 1%)
     * @param {number} periodo - Período em meses
     * @returns {object} Resultado detalhado
     */
    static jurosCompostos(capital, taxa, periodo) {
        const montante = capital * Math.pow(1 + taxa, periodo);
        const juros = montante - capital;
        const rentabilidade = (juros / capital) * 100;

        return {
            capital: capital,
            taxa: taxa * 100,
            periodo: periodo,
            montante: montante,
            juros: juros,
            rentabilidade: rentabilidade,
            formatado: {
                capital: this.formatarMoeda(capital),
                montante: this.formatarMoeda(montante),
                juros: this.formatarMoeda(juros),
                rentabilidade: `${rentabilidade.toFixed(2)}%`
            }
        };
    }

    /**
     * Calcula valor necessário para aposentadoria
     * @param {number} idadeAtual - Idade atual
     * @param {number} idadeAposentadoria - Idade desejada para aposentadoria
     * @param {number} gastoMensal - Gasto mensal desejado na aposentadoria
     * @param {number} taxaAnual - Taxa de retorno anual esperada (decimal)
     * @returns {object} Cálculo de aposentadoria
     */
    static aposentadoria(idadeAtual, idadeAposentadoria, gastoMensal, taxaAnual = 0.10) {
        const anosParaAposentar = idadeAposentadoria - idadeAtual;
        const mesesParaAposentar = anosParaAposentar * 12;
        const taxaMensal = taxaAnual / 12;
        
        // Valor necessário para gerar a renda desejada (considerando 4% de saque anual)
        const valorNecessario = gastoMensal * 12 / 0.04;
        
        // Valor mensal a investir
        const valorMensal = valorNecessario / (((Math.pow(1 + taxaMensal, mesesParaAposentar) - 1) / taxaMensal));

        return {
            idadeAtual,
            idadeAposentadoria,
            anosParaAposentar,
            gastoMensal,
            valorNecessario,
            valorMensal,
            taxaAnual: taxaAnual * 100,
            formatado: {
                gastoMensal: this.formatarMoeda(gastoMensal),
                valorNecessario: this.formatarMoeda(valorNecessario),
                valorMensal: this.formatarMoeda(valorMensal),
                taxaAnual: `${(taxaAnual * 100).toFixed(1)}%`
            }
        };
    }

    /**
     * Calcula financiamento pelo sistema SAC
     * @param {number} valorFinanciado - Valor do financiamento
     * @param {number} taxaAnual - Taxa de juros anual (decimal)
     * @param {number} prazoAnos - Prazo em anos
     * @returns {object} Detalhes do financiamento SAC
     */
    static financiamentoSAC(valorFinanciado, taxaAnual, prazoAnos) {
        const taxaMensal = taxaAnual / 12;
        const prazoMeses = prazoAnos * 12;
        const amortizacao = valorFinanciado / prazoMeses;
        
        let saldoDevedor = valorFinanciado;
        let totalJuros = 0;
        const parcelas = [];

        for (let i = 1; i <= prazoMeses; i++) {
            const juros = saldoDevedor * taxaMensal;
            const prestacao = amortizacao + juros;
            saldoDevedor -= amortizacao;
            totalJuros += juros;

            if (i <= 3 || i === prazoMeses) { // Mostra apenas primeiras 3 e última
                parcelas.push({
                    numero: i,
                    prestacao: this.formatarMoeda(prestacao),
                    amortizacao: this.formatarMoeda(amortizacao),
                    juros: this.formatarMoeda(juros),
                    saldoDevedor: this.formatarMoeda(Math.max(0, saldoDevedor))
                });
            }
        }

        const primeiraPrestacao = amortizacao + (valorFinanciado * taxaMensal);
        const ultimaPrestacao = amortizacao + (amortizacao * taxaMensal);

        return {
            valorFinanciado,
            taxaAnual: taxaAnual * 100,
            prazoAnos,
            prazoMeses,
            primeiraPrestacao,
            ultimaPrestacao,
            totalJuros,
            totalPago: valorFinanciado + totalJuros,
            parcelas,
            formatado: {
                valorFinanciado: this.formatarMoeda(valorFinanciado),
                primeiraPrestacao: this.formatarMoeda(primeiraPrestacao),
                ultimaPrestacao: this.formatarMoeda(ultimaPrestacao),
                totalJuros: this.formatarMoeda(totalJuros),
                totalPago: this.formatarMoeda(valorFinanciado + totalJuros)
            }
        };
    }

    /**
     * Calcula financiamento pelo sistema PRICE
     * @param {number} valorFinanciado - Valor do financiamento
     * @param {number} taxaAnual - Taxa de juros anual (decimal)
     * @param {number} prazoAnos - Prazo em anos
     * @returns {object} Detalhes do financiamento PRICE
     */
    static financiamentoPRICE(valorFinanciado, taxaAnual, prazoAnos) {
        const taxaMensal = taxaAnual / 12;
        const prazoMeses = prazoAnos * 12;
        
        // Fórmula da prestação fixa (PRICE)
        const prestacaoFixa = valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / 
                             (Math.pow(1 + taxaMensal, prazoMeses) - 1);

        let saldoDevedor = valorFinanciado;
        let totalJuros = 0;
        const parcelas = [];

        for (let i = 1; i <= prazoMeses; i++) {
            const juros = saldoDevedor * taxaMensal;
            const amortizacao = prestacaoFixa - juros;
            saldoDevedor -= amortizacao;
            totalJuros += juros;

            if (i <= 3 || i === prazoMeses) { // Mostra apenas primeiras 3 e última
                parcelas.push({
                    numero: i,
                    prestacao: this.formatarMoeda(prestacaoFixa),
                    amortizacao: this.formatarMoeda(amortizacao),
                    juros: this.formatarMoeda(juros),
                    saldoDevedor: this.formatarMoeda(Math.max(0, saldoDevedor))
                });
            }
        }

        return {
            valorFinanciado,
            taxaAnual: taxaAnual * 100,
            prazoAnos,
            prazoMeses,
            prestacaoFixa,
            totalJuros,
            totalPago: valorFinanciado + totalJuros,
            parcelas,
            formatado: {
                valorFinanciado: this.formatarMoeda(valorFinanciado),
                prestacaoFixa: this.formatarMoeda(prestacaoFixa),
                totalJuros: this.formatarMoeda(totalJuros),
                totalPago: this.formatarMoeda(valorFinanciado + totalJuros)
            }
        };
    }

    /**
     * Calcula impacto da inflação no poder de compra
     * @param {number} valor - Valor atual
     * @param {number} inflacaoAnual - Taxa de inflação anual (decimal)
     * @param {number} anos - Período em anos
     * @returns {object} Análise do poder de compra
     */
    static inflacao(valor, inflacaoAnual, anos) {
        const valorFuturo = valor / Math.pow(1 + inflacaoAnual, anos);
        const perdaPoder = valor - valorFuturo;
        const percentualPerda = (perdaPoder / valor) * 100;

        return {
            valorAtual: valor,
            inflacaoAnual: inflacaoAnual * 100,
            anos,
            valorFuturo,
            perdaPoder,
            percentualPerda,
            formatado: {
                valorAtual: this.formatarMoeda(valor),
                valorFuturo: this.formatarMoeda(valorFuturo),
                perdaPoder: this.formatarMoeda(perdaPoder),
                percentualPerda: `${percentualPerda.toFixed(2)}%`,
                inflacaoAnual: `${(inflacaoAnual * 100).toFixed(2)}%`
            }
        };
    }

    /**
     * Calcula regra dos 72 (tempo para dobrar investimento)
     * @param {number} taxa - Taxa de retorno anual (decimal)
     * @returns {object} Tempo para dobrar o investimento
     */
    static regraDos72(taxa) {
        const taxaPercentual = taxa * 100;
        const anosParaDobrar = 72 / taxaPercentual;
        const mesesParaDobrar = anosParaDobrar * 12;

        return {
            taxa: taxaPercentual,
            anosParaDobrar,
            mesesParaDobrar,
            formatado: {
                taxa: `${taxaPercentual.toFixed(2)}%`,
                anosParaDobrar: `${anosParaDobrar.toFixed(1)} anos`,
                mesesParaDobrar: `${mesesParaDobrar.toFixed(0)} meses`
            }
        };
    }

    /**
     * Calcula valor presente líquido (VPL)
     * @param {number} investimentoInicial - Investimento inicial
     * @param {array} fluxosCaixa - Array com fluxos de caixa futuros
     * @param {number} taxaDesconto - Taxa de desconto (decimal)
     * @returns {object} Análise VPL
     */
    static vpl(investimentoInicial, fluxosCaixa, taxaDesconto) {
        let vpl = -investimentoInicial;
        
        fluxosCaixa.forEach((fluxo, index) => {
            const periodo = index + 1;
            const valorPresente = fluxo / Math.pow(1 + taxaDesconto, periodo);
            vpl += valorPresente;
        });

        const viavel = vpl > 0;
        const tir = this.calcularTIR(investimentoInicial, fluxosCaixa);

        return {
            investimentoInicial,
            fluxosCaixa,
            taxaDesconto: taxaDesconto * 100,
            vpl,
            viavel,
            tir: tir * 100,
            formatado: {
                investimentoInicial: this.formatarMoeda(investimentoInicial),
                vpl: this.formatarMoeda(vpl),
                viavel: viavel ? '✅ Viável' : '❌ Não viável',
                tir: `${(tir * 100).toFixed(2)}%`
            }
        };
    }

    /**
     * Calcula Taxa Interna de Retorno (TIR) - aproximação
     * @param {number} investimentoInicial - Investimento inicial
     * @param {array} fluxosCaixa - Fluxos de caixa
     * @returns {number} TIR aproximada
     */
    static calcularTIR(investimentoInicial, fluxosCaixa) {
        // Método de aproximação simples
        let taxa = 0.1; // Chute inicial de 10%
        let vpl = 0;
        let tentativas = 0;
        const maxTentativas = 100;

        do {
            vpl = -investimentoInicial;
            fluxosCaixa.forEach((fluxo, index) => {
                vpl += fluxo / Math.pow(1 + taxa, index + 1);
            });

            if (Math.abs(vpl) < 0.01) break;
            
            taxa += vpl > 0 ? 0.001 : -0.001;
            tentativas++;
        } while (tentativas < maxTentativas);

        return taxa;
    }

    /**
     * Formata valor em moeda brasileira
     * @param {number} valor - Valor a ser formatado
     * @returns {string} Valor formatado
     */
    static formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    /**
     * Formata percentual
     * @param {number} valor - Valor decimal
     * @returns {string} Percentual formatado
     */
    static formatarPercentual(valor) {
        return `${(valor * 100).toFixed(2)}%`;
    }

    /**
     * Gera relatório de comparação de investimentos
     * @param {array} investimentos - Array de investimentos para comparar
     * @returns {object} Relatório comparativo
     */
    static compararInvestimentos(investimentos) {
        const resultados = investimentos.map(inv => {
            const resultado = this.jurosCompostos(inv.valor, inv.taxa, inv.periodo);
            return {
                nome: inv.nome,
                valor: inv.valor,
                taxa: inv.taxa,
                periodo: inv.periodo,
                montante: resultado.montante,
                rentabilidade: resultado.rentabilidade,
                formatado: resultado.formatado
            };
        });

        // Ordena por rentabilidade
        resultados.sort((a, b) => b.rentabilidade - a.rentabilidade);

        return {
            investimentos: resultados,
            melhorOpcao: resultados[0],
            piorOpcao: resultados[resultados.length - 1]
        };
    }
}

module.exports = CalculadorasFinanceiras;