// Middleware de tratamento de erros global
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação do AirTable
  if (err.message && err.message.includes('AirTable')) {
    return res.status(400).json({
      success: false,
      message: 'Erro na operação com o banco de dados',
      error: 'DATABASE_ERROR',
      details: err.message,
      badges: ['Mestre do CRUD'],
      xp: 0
    });
  }

  // Erro de conexão com AirTable
  if (err.message && err.message.includes('ENOTFOUND')) {
    return res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível',
      error: 'SERVICE_UNAVAILABLE',
      details: 'Erro de conexão com o banco de dados',
      badges: ['Mestre do CRUD'],
      xp: 0
    });
  }

  // Erro de autenticação do AirTable
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: 'Erro de autenticação',
      error: 'UNAUTHORIZED',
      details: 'Verifique suas credenciais do AirTable',
      badges: ['Mestre do CRUD'],
      xp: 0
    });
  }

  // Erro de limite de taxa do AirTable
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: 'Muitas requisições',
      error: 'RATE_LIMIT_EXCEEDED',
      details: 'Tente novamente em alguns minutos',
      badges: ['Mestre do CRUD'],
      xp: 0
    });
  }

  // Erro de parsing JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido',
      error: 'INVALID_JSON',
      details: 'Verifique o formato do JSON enviado',
      badges: ['Mestre do CRUD'],
      xp: 0
    });
  }

  // Erro genérico do servidor
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: 'INTERNAL_SERVER_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    badges: ['Mestre do CRUD'],
    xp: 0
  });
};

module.exports = {
  errorHandler
};
