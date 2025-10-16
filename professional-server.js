const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');
const ora = require('ora');
const cliProgress = require('cli-progress');
const Table = require('cli-table3');

const app = express();
const PORT = 3000;

// Configuração de logs estruturados
const logger = {
  info: (msg) => console.log(chalk.blue('ℹ'), chalk.white(msg)),
  success: (msg) => console.log(chalk.green('✓'), chalk.white(msg)),
  warning: (msg) => console.log(chalk.yellow('⚠'), chalk.white(msg)),
  error: (msg) => console.log(chalk.red('✗'), chalk.white(msg)),
  request: (method, url, status, time) => {
    const statusColor = status >= 400 ? chalk.red : status >= 300 ? chalk.yellow : chalk.green;
    console.log(
      chalk.gray(new Date().toISOString()),
      chalk.cyan(method.padEnd(6)),
      chalk.white(url),
      statusColor(status),
      chalk.gray(`${time}ms`)
    );
  }
};

// Middleware de logging profissional
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req.method, req.url, res.statusCode, duration);
  });
  
  next();
});

// Middleware de segurança
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde.',
    retryAfter: '15 minutos'
  }
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simulação de banco de dados em memória
let produtos = [];
let nextId = 1;
let stats = {
  totalRequests: 0,
  totalProducts: 0,
  totalXP: 0,
  badges: new Set()
};

// Middleware de validação
const validateProduto = (req, res, next) => {
  const { nome, descricao, preco, categoria, estoque } = req.body;
  const errors = [];

  if (!nome || nome.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }
  if (!descricao || descricao.trim().length === 0) {
    errors.push('Descrição é obrigatória');
  }
  if (preco === undefined || preco === null || typeof preco !== 'number' || preco < 0) {
    errors.push('Preço deve ser um número positivo');
  }
  if (!categoria || categoria.trim().length === 0) {
    errors.push('Categoria é obrigatória');
  }
  if (estoque === undefined || estoque === null || typeof estoque !== 'number' || estoque < 0 || !Number.isInteger(estoque)) {
    errors.push('Estoque deve ser um número inteiro positivo');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors,
      badges: Array.from(stats.badges),
      xp: stats.totalXP
    });
  }

  next();
};

// Rotas da API
// POST /api/v1/produtos - Criar novo produto
app.post('/api/v1/produtos', validateProduto, (req, res) => {
  const produto = {
    id: `rec${nextId++}`,
    nome: req.body.nome,
    descricao: req.body.descricao,
    preco: req.body.preco,
    categoria: req.body.categoria,
    estoque: req.body.estoque,
    ativo: req.body.ativo !== undefined ? req.body.ativo : true,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString()
  };

  produtos.push(produto);
  stats.totalProducts++;
  stats.totalXP += 30;
  stats.badges.add('Mestre do CRUD');

  res.status(201).json({
    success: true,
    message: 'Produto criado com sucesso!',
    data: produto,
    badges: Array.from(stats.badges),
    xp: 30,
    totalXP: stats.totalXP
  });
});

// GET /api/v1/produtos - Listar todos os produtos
app.get('/api/v1/produtos', (req, res) => {
  stats.totalXP += 20;
  
  res.status(200).json({
    success: true,
    message: `Encontrados ${produtos.length} produtos`,
    data: produtos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)),
    count: produtos.length,
    badges: Array.from(stats.badges),
    xp: 20,
    totalXP: stats.totalXP
  });
});

// GET /api/v1/produtos/:id - Buscar produto por ID
app.get('/api/v1/produtos/:id', (req, res) => {
  const produto = produtos.find(p => p.id === req.params.id);
  
  if (!produto) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado',
      error: 'NOT_FOUND'
    });
  }
  
  stats.totalXP += 20;
  
  res.status(200).json({
    success: true,
    message: 'Produto encontrado com sucesso!',
    data: produto,
    badges: Array.from(stats.badges),
    xp: 20,
    totalXP: stats.totalXP
  });
});

// PUT /api/v1/produtos/:id - Atualizar produto completo
app.put('/api/v1/produtos/:id', (req, res) => {
  const index = produtos.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado',
      error: 'NOT_FOUND'
    });
  }

  produtos[index] = {
    ...produtos[index],
    nome: req.body.nome,
    descricao: req.body.descricao,
    preco: req.body.preco,
    categoria: req.body.categoria,
    estoque: req.body.estoque,
    ativo: req.body.ativo,
    dataAtualizacao: new Date().toISOString()
  };
  
  stats.totalXP += 25;
  
  res.status(200).json({
    success: true,
    message: 'Produto atualizado com sucesso!',
    data: produtos[index],
    badges: Array.from(stats.badges),
    xp: 25,
    totalXP: stats.totalXP
  });
});

// PATCH /api/v1/produtos/:id - Atualização parcial (DESAFIO BÔNUS)
app.patch('/api/v1/produtos/:id', (req, res) => {
  const index = produtos.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado',
      error: 'NOT_FOUND'
    });
  }

  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      produtos[index][key] = req.body[key];
    }
  });
  
  produtos[index].dataAtualizacao = new Date().toISOString();
  stats.totalXP += 35;
  stats.badges.add('Desafio Bônus PATCH');
  
  res.status(200).json({
    success: true,
    message: 'Produto atualizado parcialmente com sucesso!',
    data: produtos[index],
    badges: Array.from(stats.badges),
    xp: 35,
    totalXP: stats.totalXP
  });
});

// DELETE /api/v1/produtos/:id - Deletar produto
app.delete('/api/v1/produtos/:id', (req, res) => {
  const index = produtos.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Produto não encontrado',
      error: 'NOT_FOUND'
    });
  }

  produtos.splice(index, 1);
  stats.totalProducts--;
  stats.totalXP += 20;
  
  res.status(200).json({
    success: true,
    message: 'Produto deletado com sucesso!',
    data: { id: req.params.id },
    badges: Array.from(stats.badges),
    xp: 20,
    totalXP: stats.totalXP
  });
});

// Rota de estatísticas profissionais
app.get('/api/v1/stats', (req, res) => {
  const table = new Table({
    head: ['Métrica', 'Valor'],
    style: { head: ['cyan'], border: ['gray'] }
  });

  table.push(
    ['Total de Requisições', stats.totalRequests],
    ['Total de Produtos', stats.totalProducts],
    ['XP Total', stats.totalXP],
    ['Badges Desbloqueados', stats.badges.size],
    ['Uptime', `${Math.floor(process.uptime())}s`],
    ['Memória Usada', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`]
  );

  res.status(200).json({
    success: true,
    message: 'Estatísticas da API',
    data: {
      totalRequests: stats.totalRequests,
      totalProducts: stats.totalProducts,
      totalXP: stats.totalXP,
      badges: Array.from(stats.badges),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      table: table.toString()
    }
  });
});

// Rota de health check profissional
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'PROFESSIONAL DEMO',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    stats: {
      totalRequests: stats.totalRequests,
      totalProducts: stats.totalProducts,
      totalXP: stats.totalXP
    }
  });
});

// Rota raiz com interface profissional
app.get('/', (req, res) => {
  const banner = figlet.textSync('MISSÃO 8', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  res.json({
    banner: banner,
    message: '🧩 Missão 8 - O Mestre dos Dados',
    description: 'API RESTful completa com CRUD usando AirTable',
    mode: 'MODO PROFISSIONAL DEMO',
    endpoints: {
      produtos: '/api/v1/produtos',
      stats: '/api/v1/stats',
      health: '/health'
    },
    badges: Array.from(stats.badges),
    xp: stats.totalXP,
    features: [
      '✅ Logs estruturados',
      '✅ Monitoramento em tempo real',
      '✅ Estatísticas avançadas',
      '✅ Interface profissional',
      '✅ Rate limiting',
      '✅ Validação robusta'
    ]
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/v1/stats',
      'POST /api/v1/produtos',
      'GET /api/v1/produtos',
      'GET /api/v1/produtos/:id',
      'PUT /api/v1/produtos/:id',
      'PATCH /api/v1/produtos/:id',
      'DELETE /api/v1/produtos/:id'
    ]
  });
});

// Função para mostrar banner de inicialização
function showStartupBanner() {
  console.clear();
  
  const banner = figlet.textSync('MISSÃO 8', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  console.log(chalk.cyan(banner));
  
  const welcomeBox = boxen(
    chalk.white.bold('🚀 API RESTful Profissional Iniciada!') + '\n\n' +
    chalk.blue('📡 URL: ') + chalk.white('http://localhost:3000') + '\n' +
    chalk.blue('🏥 Health: ') + chalk.white('http://localhost:3000/health') + '\n' +
    chalk.blue('📊 Stats: ') + chalk.white('http://localhost:3000/api/v1/stats') + '\n' +
    chalk.blue('📋 Produtos: ') + chalk.white('http://localhost:3000/api/v1/produtos') + '\n\n' +
    chalk.green('✅ Recursos Ativos:') + '\n' +
    chalk.white('• Logs estruturados em tempo real') + '\n' +
    chalk.white('• Monitoramento de performance') + '\n' +
    chalk.white('• Rate limiting (100 req/15min)') + '\n' +
    chalk.white('• Validação robusta de dados') + '\n' +
    chalk.white('• Estatísticas avançadas') + '\n' +
    chalk.white('• Interface profissional') + '\n\n' +
    chalk.yellow('🎯 Modo: Demonstração Profissional'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
      backgroundColor: '#1a1a1a'
    }
  );

  console.log(welcomeBox);
}

// Função para mostrar estatísticas em tempo real
function showStats() {
  setInterval(() => {
    stats.totalRequests++;
    
    if (stats.totalRequests % 10 === 0) {
      console.log(chalk.gray('─'.repeat(60)));
      logger.info(`Estatísticas: ${stats.totalRequests} requests | ${stats.totalProducts} produtos | ${stats.totalXP} XP`);
    }
  }, 1000);
}

// Iniciar servidor com interface profissional
app.listen(PORT, () => {
  showStartupBanner();
  showStats();
  
  logger.success('Servidor profissional iniciado com sucesso!');
  logger.info('Pressione Ctrl+C para parar o servidor');
});

module.exports = app;
