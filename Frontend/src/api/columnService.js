import { http } from './client.js';

/* Contrato real (src/routes/columnRoutes.js):
 * - POST   /api/boards/:boardId/columns            → 201, Column
 * - DELETE /api/boards/:boardId/columns/:columnId  → 204 sin cuerpo (borra tickets en cascada)
 * NOTA: NO existe PATCH de columnas (no se puede renombrar). Documentado en AGENTS.md. */

/** 201 → Column (`_id`, `name`, `board`, timestamps). 400/404 ante payload o board inválido. */
export function createColumn(boardId, name) {
  return http.post(`/boards/${boardId}/columns`, { name });
}

/** 204 → null (exitoso). 404 si la columna no existe o no pertenece al tablero. */
export function deleteColumn(boardId, columnId) {
  return http.delete(`/boards/${boardId}/columns/${columnId}`);
}
