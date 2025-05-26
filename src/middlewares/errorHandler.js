export default (err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'Erro interno',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  