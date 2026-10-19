# Kanban Lite (frontend)

Tablero espartano de karting: consume **exactamente los 6 endpoints** de la API
`kanban-api-rest` (repo raíz), sin backend propio, sin login y sin librerías de estado
global. La potencia vive en el contrato, no en la UI.

## Requisitos

- Node.js 20+ (probado con 24)
- Backend corriendo: `npm run dev` en el repo raíz + MongoDB activo

## Instalación y ejecución

```bash
cd Frontend
cp .env.example .env     # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev              # http://localhost:5173
npm run build            # build de producción en dist/
```

## Cómo funciona

- **/ — Entrada:** no hay boards listados porque la API no tiene `GET /api/boards`;
  se abre un tablero por `boardId` (24 hex) o se crea uno nuevo (`POST /api/boards`,
  y `useNavigate` lo abre tras el 201). Los últimos tableros visitados quedan en
  `localStorage` (`kanban-lite-boards`).
- **/boards/:boardId — Kanban:** columnas como líneas (cabecera con 🗑, pie con +).
- **Rehydrator:** la API no lista tickets (solo columnas). Los tickets que la sesión
  crea/edita/mueve se acumulan en memoria (`src/features/tickets/ticketStore.js`);
  borrar una columna descarta su caché. Limitación documentada, no simulada.
- **Mover tickets:** drag & drop nativo entre líneas (HTML5, sin librerías) + fallback
  accesible `<select>` "Mover a…" por ticket (única vía en touch móvil). Optimista con
  reversión ante 400/404 + Toast; el PATCH repetido idéntico (404 del contrato) se
  resuelve silenciosamente: el ticket ya vive en la columna destino.
- **Feedback por HTTP:** 201/200 verde, avisos ámbar, errores rojos con el mensaje
  literal `"error": "..."` del backend (nunca se inventan textos).
- **Borrar columna:** modal de confirmación con la advertencia de cascada
  ("borra N tickets de la sesión") + 204 del backend.

## Stack (dependencias al mínimo)

| Capa | Herramienta |
|---|---|
| UI | React 18 + JSX (JavaScript) |
| Build | Vite 5 |
| Rutas | react-router-dom 6 (`/`, `/boards/:boardId`) |
| HTTP | `fetch` nativo en `src/api/client.js` |
| Tema | CSS variables globales (Minimalismo Developer, light/dark) |

Sin Axios (fetch), sin TanStack Query (stores mínimos por módulo), sin form libs
(validación nativa + errores del contrato). Decisiones y desvíos respecto de la
consigna base: `docs/REQUERIMIENTOS.md` §C.

## Estructura

```
Frontend/src/
├── api/        # client.js (fetch + ApiError) + board/column/ticketService
├── components/ # atómicos presentacionales: Button, TextInput, Spinner, Toasts,
│               #   Column, TicketCard, ConfirmDialog
├── features/   # boxes/boards (recentBoards), columns (AddColumnForm),
│               #   tickets (rehydrator store + formularios + mover)
├── hooks/      # useColumnTickets, useToasts (useSyncExternalStore)
├── pages/      # HomePage, BoardDetailPage (contenedores)
└── styles/     # global.css: tokens del tema (única fuente de colores)
```

## Estado y fases

Ver `AGENTS.md` (§8 flujo por fases y §14 estado): fases 0–3 entregadas y
compilando; pendiente drag & drop nativo (F4), modo demo/toggle de tema/README
final (F5) y la prueba de integración completa contra el backend real.

## Notas de integración con el backend

- El frontend respeta el contrato sin inventar endpoints. Necesidades de backend
  documentadas (no simuladas): `GET /api/boards` y
  `GET /api/boards/:boardId/columns/:columnId/tickets`.
- El backend escucha en `PORT` del `.env` del repo raíz; `VITE_API_URL` debe incluir
  el prefijo `/api`.
