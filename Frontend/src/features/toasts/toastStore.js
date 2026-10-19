/*
 * Store de toasts (Kanban Lite: sin estado global — store mínimo por módulo).
 * auto-dismiss con setTimeout acá, NUNCA dentro de componentes presentacionales.
 */

let toasts = [];
let nextId = 1;
const listeners = new Set();
const timers = new Map();

const DEFAULT_TIMEOUT_MS = 5000;
const ERROR_TIMEOUT_MS = 8000;

function commit(next) {
  toasts = next;
  for (const listener of listeners) listener();
}

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getToasts() {
  return toasts;
}

export function dismissToast(id) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  if (!toasts.some((t) => t.id === id)) return;
  commit(toasts.filter((t) => t.id !== id));
}

/** Variants: 'success' (201/200), 'info' (aún nada / avisos), 'error' (400/500). */
export function showToast(message, variant = 'info', timeoutMs = DEFAULT_TIMEOUT_MS) {
  const id = nextId++;
  commit([...toasts, { id, message, variant }]);
  timers.set(id, setTimeout(() => dismissToast(id), timeoutMs));
}

export function showSuccess(message) {
  showToast(message, 'success');
}

export function showError(message) {
  showToast(message, 'error', ERROR_TIMEOUT_MS);
}
