/*
 * Cliente HTTP único del frontend. TODA petición pasa por acá (R9).
 * La URL base se obtiene EXCLUSIVAMENTE de import.meta.env.VITE_API_URL (R29).
 * Sin Axios ni TanStack Query: fetch nativo — decisión "Kanban Lite, dependencias
 * al mínimo" documentada en AGENTS.md §13.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  // Falla en tiempo de desarrollo, no en runtime del usuario: la app no puede
  // consumir la API sin esta variable y no debe adivinar otra URL.
  console.error('[api/client] Falta VITE_API_URL. Copiá .env.example a .env.');
}

/** Error de dominio: status HTTP + mensaje del contrato `"error": "..."` (sección 8 del backend). */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (networkError) {
    // red caída / backend apagado: no es un status HTTP del contrato
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* cuerpos vacíos o no-JSON: se tratan como null */
  }

  if (!response.ok) {
    // El backend SIEMPRE responde { "error": "mensaje" }: lo pasamos tal cual, sin inventar textos.
    throw new ApiError(data?.error ?? `Error ${response.status}.`, response.status);
  }

  return data;
}

export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
