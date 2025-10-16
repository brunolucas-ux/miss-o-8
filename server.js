const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
// validação mínima das variáveis de ambiente em tempo de execução
const requiredEnv = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME'];
const missing = requiredEnv.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
if (missing.length > 0) {
  // Mensagem amigável para o terminal
  console.error('\n[Config] Variáveis de ambiente ausentes:', missing.join(', '));
  console.error('[Config] Crie um arquivo .env baseado em env.example e preencha suas credenciais.');
  console.error('[Config] Alternativamente, exporte-as no shell antes de iniciar.');
}

const produtoRoutes = require('./routes/produtoRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite de 100 requests por IP
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde.',
    retryAfter: '15 minutos'
  }
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/v1/produtos', produtoRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🧩 Missão 8 - O Mestre dos Dados',
    description: 'API RESTful completa com CRUD usando AirTable',
    endpoints: {
      produtos: '/api/v1/produtos',
      health: '/health'
    },
    badges: ['Mestre do CRUD', 'Desafio Bônus PATCH'],
    xp: 170
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/v1/produtos',
      'GET /api/v1/produtos',
      'GET /api/v1/produtos/:id',
      'PUT /api/v1/produtos/:id',
      'PATCH /api/v1/produtos/:id',
      'DELETE /api/v1/produtos/:id'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Endpoints: http://localhost:${PORT}/api/v1/produtos`);
});

module.exports = app;
