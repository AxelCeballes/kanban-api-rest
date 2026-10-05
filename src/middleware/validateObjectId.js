const validateObjectId = (req, res, next) => {
  const ids = ['boardId', 'columnId', 'ticketId'];
  const regex = /^[0-9a-fA-F]{24}$/;

  for (const idParam of ids) {
    if (req.params[idParam] && !regex.test(req.params[idParam])) {
      return res.status(400).json({ error: `El formato del parámetro ${idParam} es inválido.` });
    }
  }
  next();
};

module.exports = validateObjectId;