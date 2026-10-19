import { http } from './client.js';

/* Contrato real del backend (verificado 2026-10-19 contra src/routes/boardRoutes.js):
 * - POST /api/boards            → 201, Board
 * - GET  /api/boards/:boardId   → 200, Board con `columns: Column[]` pobladas (sin tickets)
 * NOTA: NO existe GET /api/boards (lista) ni DELETE de tablero. El "listado" de la
 * UI se resuelve con localStorage (últimos boards usados): limitación documentada. */

/** 201 → Board (`_id`, `name`, timestamps). */
export function createBoard(name) {
  return http.post('/boards', { name });
}

/** 200 → Board + `columns`. 404 cuando el boardId no existe (o es malformado→400). */
export function getBoard(boardId) {
  return http.get(`/boards/${boardId}`);
}
