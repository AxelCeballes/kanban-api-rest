import { http } from './client.js';

/* Contrato real (src/routes/ticketRoutes.js + ticketController.js):
 * - POST  /api/boards/:boardId/columns/:columnId/tickets            → 201, Ticket
 * - PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId  → 200, Ticket
 *
 * Semántica del PATCH (verificada en el controlador):
 * - el :columnId de la URL es la columna ACTUAL del ticket;
 * - la columna destino viaja en el body `{ "column": "<id>" }` y debe ser del MISMO board;
 * - solo acepta title, description, column (campos del ticket: title y description únicamente);
 * - mover a la columna en la que ya está → 200 (idempotente);
 * - PATCH idéntico repetido a OTRA columna → 404 (el ticket ya no está en la columna de la URL). */
const basePath = (boardId, columnId, ticketId = '') =>
  `/boards/${boardId}/columns/${columnId}/tickets${ticketId ? `/${ticketId}` : ''}`;

/** 201 → Ticket (`_id`, `title`, `description`, `column`, `board`, timestamps). */
export function createTicket(boardId, columnId, { title, description = '' }) {
  return http.post(basePath(boardId, columnId), { title, description });
}

/** 200 → Ticket con title/description actualizados. */
export function updateTicketContent(boardId, columnId, ticketId, { title, description }) {
  return http.patch(basePath(boardId, columnId, ticketId), { title, description });
}

/** 200 → Ticket movido. 404/400 según los casos del contrato (ver AGENTS.md §14). */
export function moveTicket(boardId, columnId, ticketId, targetColumnId) {
  return http.patch(basePath(boardId, columnId, ticketId), { column: targetColumnId });
}
