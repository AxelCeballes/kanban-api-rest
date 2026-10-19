const Board = require('../models/Board');
const Column = require('../models/Column');

const createBoard = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del tablero es requerido.' });
    }
    const newBoard = await Board.create({ name });
    res.status(201).json(newBoard);
  } catch (error) {
    next(error);
  }
};

const getBoardById = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'El tablero no existe.' });
    }
    // Obtener las columnas asociadas al tablero
    const columns = await Column.find({ board: boardId });
    
    // Devolvemos el tablero con sus columnas pobladas
    res.status(200).json({
      ...board.toObject(),
      columns
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBoard, getBoardById };