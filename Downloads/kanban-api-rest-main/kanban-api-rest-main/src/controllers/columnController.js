const Column = require('../models/Column');

const createColumn = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la columna es requerido.' });
    }

    const newColumn = await Column.create({ name, board: boardId });
    res.status(201).json(newColumn);
  } catch (error) {
    next(error);
  }
};

const deleteColumn = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    const column = await Column.findById(columnId);

    if (!column) {
      return res.status(404).json({ error: 'La columna no existe.' });
    }

    // Usamos deleteOne para disparar el hook de borrado en cascada de los tickets
    await column.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { createColumn, deleteColumn };