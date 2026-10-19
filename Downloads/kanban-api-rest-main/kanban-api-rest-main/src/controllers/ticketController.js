const Ticket = require('../models/Ticket');
const Column = require('../models/Column');

const createTicket = async (req, res, next) => {
  try {
    const { boardId, columnId } = req.params;
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'El título del ticket es requerido.' });
    }

    const newTicket = await Ticket.create({
      title,
      description: description || '',
      column: columnId,
      board: boardId
    });

    res.status(201).json(newTicket);
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { boardId, columnId, ticketId } = req.params;
    const { title, description, column: newColumnId } = req.body;

    const ticket = await Ticket.findOne({ _id: ticketId, column: columnId, board: boardId });
    if (!ticket) {
      return res.status(404).json({ error: 'El ticket no existe o no pertenece a esta ruta.' });
    }

    if (newColumnId) {
      // Validar que la columna de destino exista y pertenezca al mismo tablero
      const targetColumn = await Column.findOne({ _id: newColumnId, board: boardId });
      if (!targetColumn) {
        return res.status(400).json({ error: 'La columna de destino no existe o pertenece a otro tablero.' });
      }
      ticket.column = newColumnId;
    }

    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;

    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTicket, updateTicket };