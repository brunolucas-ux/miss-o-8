const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

// Middleware de segurança
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
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
      badges: ['Mestre do CRUD'],
      xp: 0
    });
  }

  next();
};

// Rotas da API
// Logger simples com cores ANSI
const color = {
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? color.red : res.statusCode >= 400 ? color.yellow : color.green;
    const method = req.method.padEnd(6);
    console.log(`${color.gray(new Date().toISOString())} ${color.cyan(method)} ${req.originalUrl} ${statusColor(res.statusCode)} ${color.gray(`${duration}ms`)}`);
  });
  next();
});
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

  res.status(201).json({
    success: true,
    message: 'Produto criado com sucesso!',
    data: produto,
    badges: ['Mestre do CRUD'],
    xp: 30
  });
});

// GET /api/v1/produtos - Listar todos os produtos
app.get('/api/v1/produtos', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Encontrados ${produtos.length} produtos`,
    data: produtos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)),
    count: produtos.length,
    badges: ['Mestre do CRUD'],
    xp: 20
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
  
  res.status(200).json({
    success: true,
    message: 'Produto encontrado com sucesso!',
    data: produto,
    badges: ['Mestre do CRUD'],
    xp: 20
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
  
  res.status(200).json({
    success: true,
    message: 'Produto atualizado com sucesso!',
    data: produtos[index],
    badges: ['Mestre do CRUD'],
    xp: 25
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

  // Atualizar apenas campos fornecidos
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      produtos[index][key] = req.body[key];
    }
  });
  
  produtos[index].dataAtualizacao = new Date().toISOString();
  
  res.status(200).json({
    success: true,
    message: 'Produto atualizado parcialmente com sucesso!',
    data: produtos[index],
    badges: ['Mestre do CRUD', 'Desafio Bônus PATCH'],
    xp: 35
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
  
  res.status(200).json({
    success: true,
    message: 'Produto deletado com sucesso!',
    data: { id: req.params.id },
    badges: ['Mestre do CRUD'],
    xp: 20
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'DEMO (sem AirTable)'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🧩 Missão 8 - O Mestre dos Dados',
    description: 'API RESTful completa com CRUD usando AirTable',
    mode: 'MODO DEMONSTRAÇÃO (sem AirTable)',
    endpoints: {
      produtos: '/api/v1/produtos',
      health: '/health'
    },
    badges: ['Mestre do CRUD', 'Desafio Bônus PATCH'],
    xp: 170,
    note: 'Esta é uma versão de demonstração que funciona sem AirTable'
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
  const line = '═'.repeat(60);
  console.log(`\n${color.cyan(line)}`);
  console.log(color.cyan('🚀  Servidor DEMO iniciado com sucesso'));
  console.log(color.cyan(line));
  console.log(`📡  URL:        ${color.green(`http://localhost:${PORT}`)}`);
  console.log(`🏥  Health:     ${color.green(`http://localhost:${PORT}/health`)}`);
  console.log(`📋  Produtos:   ${color.green(`http://localhost:${PORT}/api/v1/produtos`)}`);
  console.log(`🎯  Modo:       ${color.yellow('Demonstração (sem AirTable)')}`);
  console.log(color.cyan(line) + '\n');
});

module.exports = app;
