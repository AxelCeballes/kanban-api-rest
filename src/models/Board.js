const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

// Hook para borrado en cascada: al eliminar un Board, borra sus Columnas
boardSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const Column = mongoose.model('Column');
  const columns = await Column.find({ board: this._id });
  for (const column of columns) {
    await column.deleteOne();
  }
  next();
});

module.exports = mongoose.model('Board', boardSchema);