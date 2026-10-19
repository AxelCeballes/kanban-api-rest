/*
 * Rehydrator: caché en memoria de tickets por columnId (concepto Kanban Lite).
 * El backend NO expone GET de tickets; aquí se acumulan los tickets que la UI
 * conoce a medida que se crean (POST devuelve el documento), editan o mueven
 * (PATCH devuelve el documento). Los arrays se reemplazan completos para que
 * useSyncExternalStore detecte el cambio con referencias distintas.
 * Limitación documentada en AGENTS.md §4.1: es caché de sesión, nunca se simula
 * un fetching que el contrato no tiene. Borrar una columna descarta su caché.
 */

const ticketsByColumn = new Map();
const listeners = new Set();

function commit() {
  for (const listener of listeners) listener();
}

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Snapshot para el hook: siempre devuelve el MISMO array si no hubo cambios. */
export function getCachedTickets(columnId) {
  return ticketsByColumn.get(columnId) ?? [];
}

export function hasCachedTicket(columnId, ticketId) {
  return ticketsByColumn.get(columnId)?.some((t) => t._id === ticketId) ?? false;
}

/** POST de ticket → se agrega al final de su columna. */
export function cacheTicket(columnId, ticket) {
  const current = ticketsByColumn.get(columnId) ?? [];
  if (current.some((t) => t._id === ticket._id)) return;
  ticketsByColumn.set(columnId, [...current, ticket]);
  commit();
}

/** PATCH de contenido → reemplaza la versión por la que devolvió el servidor (R27). */
export function replaceCachedTicket(columnId, ticket) {
  const current = ticketsByColumn.get(columnId) ?? [];
  const index = current.findIndex((t) => t._id === ticket._id);
  if (index === -1) {
    ticketsByColumn.set(columnId, [...current, ticket]); // llegó de otra columna/sesión
  } else {
    const next = current.slice();
    next[index] = ticket;
    ticketsByColumn.set(columnId, next);
  }
  commit();
}

/** Remueve una copia puntual de una columna (ej.: copia vieja tras un movimiento). */
export function removeCachedTicket(columnId, ticketId) {
  const current = ticketsByColumn.get(columnId);
  if (!current) return;
  const next = current.filter((t) => t._id !== ticketId);
  if (next.length === current.length) return;
  ticketsByColumn.set(columnId, next);
  commit();
}

/** DELETE de columna → su caché desaparece con la cascada del backend. */
export function dropColumnCache(columnId) {
  if (!ticketsByColumn.delete(columnId)) return;
  commit();
}

/** Movimiento optimista: quitar de la columna origen y agregar en la destino. */
export function moveCachedTicket(fromColumnId, toColumnId, ticket) {
  const origin = ticketsByColumn.get(fromColumnId) ?? [];
  ticketsByColumn.set(fromColumnId, origin.filter((t) => t._id !== ticket._id));

  const target = ticketsByColumn.get(toColumnId) ?? [];
  if (!target.some((t) => t._id === ticket._id)) {
    ticketsByColumn.set(toColumnId, [...target, { ...ticket, column: toColumnId }]);
  }
  commit();
}
