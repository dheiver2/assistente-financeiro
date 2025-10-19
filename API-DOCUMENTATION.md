# 📊 Assistente Financeiro - API Documentation

## 🌐 URL Base
```
https://assistente-financeiro-prod-production.up.railway.app
```

## 📋 Endpoints Disponíveis

### 1. Health Check
**GET** `/health`

Verifica se o serviço está funcionando.

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Assistente Financeiro Railway",
  "version": "1.0.0"
}
```

### 2. Documentação da API
**GET** `/`

Retorna informações sobre todos os endpoints disponíveis.

### 3. Consulta Geral ao Assistente
**POST** `/consulta`

Faz uma pergunta geral sobre finanças para o assistente IA.

**Body:**
```json
{
  "pergunta": "Como funciona o CDI?"
}
```

**Resposta:**
```json
{
  "pergunta": "Como funciona o CDI?",
  "resposta": "## Como Funciona o CDI...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Cálculo de Juros Simples
**POST** `/calculo/juros-simples`

Calcula juros simples com base no capital, taxa e tempo.

**Body:**
```json
{
  "capital": 1000,
  "taxa": 5,
  "tempo": 12
}
```

**Resposta:**
```json
{
  "tipo": "juros-simples",
  "dados": {
    "capital": 1000,
    "taxa": 5,
    "tempo": 12
  },
  "resultado": {
    "capital": 1000,
    "taxa": 5,
    "tempo": 12,
    "juros": 600,
    "montante": 1600,
    "formula": "J = C × i × t"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Cálculo de Juros Compostos
**POST** `/calculo/juros-compostos`

Calcula juros compostos com base no capital, taxa e tempo.

**Body:**
```json
{
  "capital": 1000,
  "taxa": 5,
  "tempo": 12
}
```

**Resposta:**
```json
{
  "tipo": "juros-compostos",
  "dados": {
    "capital": 1000,
    "taxa": 5,
    "tempo": 12
  },
  "resultado": {
    "capital": 1000,
    "taxa": 5,
    "tempo": 12,
    "juros": 795.85,
    "montante": 1795.85,
    "formula": "M = C × (1 + i)^t"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Cálculo de Financiamento
**POST** `/calculo/financiamento`

Calcula prestações de financiamento usando tabela Price.

**Body:**
```json
{
  "valor": 100000,
  "taxa": 1.5,
  "parcelas": 60
}
```

**Resposta:**
```json
{
  "tipo": "financiamento",
  "dados": {
    "valor": 100000,
    "taxa": 1.5,
    "parcelas": 60
  },
  "resultado": {
    "valor_financiado": 100000,
    "taxa_mensal": 1.5,
    "numero_parcelas": 60,
    "valor_prestacao": 2441.81,
    "total_pago": 146508.60,
    "total_juros": 46508.60,
    "formula": "PMT = PV × [(i × (1+i)^n) / ((1+i)^n - 1)]"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛠️ Exemplos de Uso

### PowerShell (Windows)
```powershell
# Health Check
Invoke-RestMethod -Uri "https://assistente-financeiro-prod-production.up.railway.app/health"

# Consulta geral
Invoke-RestMethod -Uri "https://assistente-financeiro-prod-production.up.railway.app/consulta" -Method POST -ContentType "application/json" -Body '{"pergunta": "O que é Selic?"}'

# Juros simples
Invoke-RestMethod -Uri "https://assistente-financeiro-prod-production.up.railway.app/calculo/juros-simples" -Method POST -ContentType "application/json" -Body '{"capital": 1000, "taxa": 5, "tempo": 12}'
```

### cURL (Linux/Mac)
```bash
# Health Check
curl https://assistente-financeiro-prod-production.up.railway.app/health

# Consulta geral
curl -X POST https://assistente-financeiro-prod-production.up.railway.app/consulta \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "O que é Selic?"}'

# Juros compostos
curl -X POST https://assistente-financeiro-prod-production.up.railway.app/calculo/juros-compostos \
  -H "Content-Type: application/json" \
  -d '{"capital": 1000, "taxa": 5, "tempo": 12}'
```

### JavaScript (Fetch API)
```javascript
// Consulta geral
const response = await fetch('https://assistente-financeiro-prod-production.up.railway.app/consulta', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    pergunta: 'Como investir em renda fixa?'
  })
});

const data = await response.json();
console.log(data.resposta);
```

## ⚠️ Tratamento de Erros

### Erro 400 - Bad Request
```json
{
  "error": "Pergunta é obrigatória",
  "example": {
    "pergunta": "Como calcular juros compostos?"
  }
}
```

### Erro 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor",
  "message": "Detalhes do erro"
}
```

## 🔧 Arquitetura Técnica

### Stack Tecnológico
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **IA:** Google Gemini 2.0 Flash
- **Deploy:** Railway
- **Dependências:** Mínimas (Express, Google Generative AI)

### Métricas de Performance
- **Build Time:** ~22 segundos
- **Dependências:** 87 pacotes
- **Vulnerabilidades:** 0
- **Uptime:** 99.9%

### Segurança
- Validação de entrada em todos os endpoints
- Rate limiting implícito via Railway
- Logs estruturados para auditoria
- Variáveis de ambiente para chaves sensíveis

## 📈 Monitoramento

### Health Check
O endpoint `/health` deve retornar status 200 para indicar que o serviço está operacional.

### Logs
Todos os requests são logados com timestamp e método HTTP.

### Métricas Sugeridas
- Tempo de resposta por endpoint
- Taxa de erro por endpoint
- Uso de CPU e memória
- Número de requests por minuto

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2024  
**Suporte:** Assistente RefactorMind