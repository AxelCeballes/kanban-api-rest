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

// Manejador global de errores (siempre al final)
app.use(errorHandler);

module.exports = app;