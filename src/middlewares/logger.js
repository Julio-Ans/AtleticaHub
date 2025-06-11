// Middleware de logging avançado para debug de produção

function createLogger(moduleName) {
  const logLevels = {
    ERROR: '❌',
    WARN: '⚠️',
    INFO: 'ℹ️',
    DEBUG: '🔍',
    SUCCESS: '✅'
  };

  return {
    error: (message, data = {}) => {
      console.error(`${logLevels.ERROR} [${moduleName}] ${message}`, data);
    },
    warn: (message, data = {}) => {
      console.warn(`${logLevels.WARN} [${moduleName}] ${message}`, data);
    },
    info: (message, data = {}) => {
      console.log(`${logLevels.INFO} [${moduleName}] ${message}`, data);
    },
    debug: (message, data = {}) => {
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
        console.log(`${logLevels.DEBUG} [${moduleName}] ${message}`, data);
      }
    },
    success: (message, data = {}) => {
      console.log(`${logLevels.SUCCESS} [${moduleName}] ${message}`, data);
    }
  };
}

// Middleware para logar todas as requisições de autenticação
function authRequestLogger(req, res, next) {
  const logger = createLogger('AUTH-REQUEST');
  
  if (req.url.includes('/auth') || req.url.includes('/api/auth')) {
    const requestData = {
      method: req.method,
      url: req.url,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 100),
      hasAuth: !!req.headers.authorization,
      authFormat: req.headers.authorization?.startsWith('Bearer ') ? 'Bearer' : 'Invalid',
      contentType: req.headers['content-type'],
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };
    
    logger.info('Requisição de autenticação recebida', requestData);
  }
  
  next();
}

// Middleware para interceptar respostas e logar erros
function responseLogger(req, res, next) {
  const logger = createLogger('AUTH-RESPONSE');
  const originalSend = res.send;
  
  if (req.url.includes('/auth') || req.url.includes('/api/auth')) {
    res.send = function(data) {
      if (res.statusCode >= 400) {
        logger.error('Resposta de erro em autenticação', {
          statusCode: res.statusCode,
          url: req.url,
          method: req.method,
          responseData: typeof data === 'string' ? JSON.parse(data) : data,
          timestamp: new Date().toISOString()
        });
      } else {
        logger.success('Resposta de sucesso em autenticação', {
          statusCode: res.statusCode,
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }
      
      return originalSend.call(this, data);
    };
  }
  
  next();
}

module.exports = {
  createLogger,
  authRequestLogger,
  responseLogger
};
