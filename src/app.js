const express = require('express');
const cors = require('cors');
const boardRoutes = require('./routes/boardRoutes');
const columnRoutes = require('./routes/columnRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Montaje de rutas anidadas respetando la jerarquía
app.use('/api/boards', boardRoutes);
app.use('/api/boards/:boardId/columns', columnRoutes);
app.use('/api/boards/:boardId/columns/:columnId/tickets', ticketRoutes);

// Rutas inexistentes: siempre JSON, antes del manejador de errores
app.use((req, res) => {
  res.status(404).json({ error: 'La ruta solicitada no existe.' });
});

// Manejador global de errores (siempre al final)
app.use(errorHandler);

module.exports = app;