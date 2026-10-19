const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true }
}, { timestamps: true });

// Hook para borrado en cascada: al eliminar una Column, borra sus Tickets
columnSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const Ticket = mongoose.model('Ticket');
  await Ticket.deleteMany({ column: this._id });
  next();
});

module.exports = mongoose.model('Column', columnSchema);