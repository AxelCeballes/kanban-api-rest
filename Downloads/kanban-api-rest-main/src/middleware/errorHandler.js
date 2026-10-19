const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: 'Datos de entrada inválidos o error de tipo en los campos.' });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Error interno del servidor.' : err.message;

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;