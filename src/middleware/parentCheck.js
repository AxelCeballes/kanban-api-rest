const Board = require('../models/Board');
const Column = require('../models/Column');

const checkBoardExists = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'El tablero especificado no existe.' });
    }
    req.board = board;
    next();
  } catch (error) {
    next(error);
  }
};

const checkColumnBelongsToBoard = async (req, res, next) => {
  try {
    const { boardId, columnId } = req.params;
    const column = await Column.findOne({ _id: columnId, board: boardId });
    if (!column) {
      return res.status(404).json({ error: 'La columna no existe o no pertenece a este tablero.' });
    }
    req.column = column;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkBoardExists, checkColumnBelongsToBoard };