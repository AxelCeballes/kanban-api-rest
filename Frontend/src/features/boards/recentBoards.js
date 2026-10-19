/* Historial de tableros visitados (localStorage).
 * Reemplaza al inexistente `GET /api/boards`: es la única forma honesta de
 * "listar tableros" con este contrato — ver AGENTS.md §4.2. */

const STORAGE_KEY = 'kanban-lite-boards';
const MAX_REMEMBERED = 5;

function sanitize(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((b) => b && /^[0-9a-fA-F]{24}$/.test(String(b.id)))
    .map((b) => ({ id: String(b.id), name: typeof b.name === 'string' ? b.name : 'Tablero' }));
}

export function getRecentBoards() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

export function rememberBoard(boardId, boardName) {
  const recent = getRecentBoards().filter((b) => b.id !== boardId);
  const next = [{ id: boardId, name: boardName }, ...recent].slice(0, MAX_REMEMBERED);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* localStorage puede estar bloqueado: se ignora el historial */
  }
}
