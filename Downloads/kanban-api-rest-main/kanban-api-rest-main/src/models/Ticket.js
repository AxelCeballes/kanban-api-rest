const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  column: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true, index: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);