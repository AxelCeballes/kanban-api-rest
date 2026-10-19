# AGENTS.md — Frontend Kanban Lite

Fuente de la verdad del frontend. El agente debe leerlo completo antes de escribir código.
Complementa a `docs/REQUERIMIENTOS.md` (especificación extendida) y convive con el AGENTS.md
del backend (carpeta raíz), que describe el contrato REST que este frontend consume.

**Estado (2026-10-19, fases 0–4):** Fase 0 (scaffold + tokens + docs), Fase 1 (capa de
servicio `src/api`), Fases 2–3 (componentes atómicos + vistas/rutas funcionales) y
**Fase 4 — drag & drop nativo** (HTML5 drag events, sin librería; el `<select>
"Mover a…"` queda como fallback accesible y para touch) entregadas. Lógica de
movimiento única (`handleMove` en BoardDetailPage) compartida por drag y select:
optimista sobre el rehydrator, reversión ante 400/404 y caso especial del
404-duplicado resuelto silenciosamente (§4.1). Verificado con `npm run build` ✓ y
escaneo de código; **la interacción real de arrastre queda pendiente de probarse
contra el backend corriendo** (no hay MongoDB/Docker en esta máquina). Fase 5
(modo demo, toggle de tema, README final, registro de pruebas): pendiente.

---

## 1. Concepto: "Kanban Lite"

Tablero espartano de karting: un frontend mínimamente encantador que consume **exactamente los
6 endpoints** del backend, sin backend propio, **sin login**, sin librerías de estado global.
La UI expone la potencia del contrato: columnas como líneas verticales, tickets con
drag-and-drop + fallback `<select>`, feedback por código HTTP y modo demo del flujo completo.

Decisión de stack elegida por el usuario: **Vite + React** (no vanilla), según la matriz de
rutas `/` y `/boards/:boardId` que sigue el espíritu de los endpoints anidados.

## 2. Stack (dependencias al mínimo)

| Componente | Versión / librería |
|---|---|
| Runtime | Node.js 20+ |
| Bundler | Vite 5 |
| UI | React 18 (`react`, `react-dom`) |
| Router | react-router-dom 6 (`BrowserRouter`, `useParams`, `useNavigate`) |
| HTTP | `fetch` nativo en `src/api/client.js` |
| Lenguaje | JavaScript + JSX, módulos ES |

- **PROHIBIDO** agregar más dependencias (Axios, TanStack Query, RHF+Zod, Tailwind, MSW…)
  sin pedirlo explícitamente. La consigna original sugería Axios + TanStack Query + RHF/Zod;
  el usuario eligió el concepto minimalista "Kanban Lite" → fetch nativo, estado local y
  validación nativa de formularios + mapeo de los 400 reales del contrato. Desvíos de la
  especificación base: ver §13.
- **PROHIBIDO** TypeScript.

## 3. Estructura (no crear carpetas fuera de esta lista)

```
Frontend/
├── docs/                # REQUERIMIENTOS.md y decisiones
├── src/
│   ├── api/             # client.js + boardService.js + columnService.js + ticketService.js
│   ├── components/      # UI reutilizable y presentacional (Button, Input, Column, TicketCard…)
│   ├── features/        # módulos por dominio: boards/, columns/, tickets/ (rehydrator acá)
│   ├── hooks/           # hooks reutilizables (useTheme, useBoardCache…)
│   ├── pages/           # HomePage.jsx, BoardDetailPage.jsx
│   ├── routes/          # matriz de rutas si App.jsx crece
│   └── styles/          # global.css con tokens del tema
├── index.html           # script anti-flash de tema
├── .env.example         # VITE_API_URL
└── vite.config.js
```

## 4. Contrato REST que el frontend consume (fuente de verdad: backend AGENTS.md §6)

| Método | Endpoint | Respuesta de éxito |
|---|---|---|
| POST | `/api/boards` | 201 Board |
| GET | `/api/boards/:boardId` | 200 Board + `columns` (SIN tickets) |
| POST | `/api/boards/:boardId/columns` | 201 Column |
| DELETE | `/api/boards/:boardId/columns/:columnId` | 204 sin cuerpo |
| POST | `/api/boards/:boardId/columns/:columnId/tickets` | 201 Ticket |
| PATCH | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | 200 Ticket |

Semántica del PATCH al mover: el `:columnId` de la URL es la columna ACTUAL; la destino va en
el body `{ "column": "<id>" }` y debe pertenecer al mismo tablero. Mover a la columna en la
que ya está → 200. PATCH idéntico repetido a otra columna → 404 (el ticket ya no está en la
columna de la URL). El ticket SOLO tiene `title` y `description` (+ `_id`, `column`, `board`,
timestamps).

### 4.1 Rehydrator (módulo de caché en memoria de tickets)

El GET de tablero devuelve columnas sin tickets y **el backend no tiene endpoint de
consulta de tickets**. El "rehydrator" (`src/features/tickets/`) acumula en un Map en memoria
los tickets que la UI conoce `a medida que se manipulan` (al crear un ticket el POST devuelve
el documento; al moverlo o editarlo, lo hace el PATCH). Reglas:

- El cache es de sesión: al recargar la página una columna muestra solo lo que el contrato
  puede dar. **NO simular fetching de tickets que no existe.**
- Al borrar una columna, se descarta su entrada del cache.
- Al recibir 404 en un PATCH de movimiento idéntico repetido: el ticket de facto vive en la
  columna destino → se remueve de la columna origen, sin error visible (la UI "se actualiza
  al estado final" como pide el concepto). Cualquier OTRO 404/400 sí muestra Toast.
- Necesidad de backend documentada: `GET /api/boards/:boardId/columns/:columnId/tickets`.

### 4.2 Limitaciones ya documentadas (no re-intentarlas)

- No hay GET de lista de tableros → la home pide/crea boardId y recuerda los últimos con
  `localStorage`.
- No hay edición (PATCH) de columnas, ni DELETE de tablero, ni DELETE de ticket.
- No hay auth: rutas públicas, `/login` no existe.

## 5. Reglas de arquitectura

1. **Separación estricta:** `src/api` = llamadas REST; features = lógica de dominio; `pages` =
   contenedores con estado; `components` = presentacionales tontos (solo props + UI, sin
   `useEffect` ni llamadas HTTP).
2. Ningún componente visual hace HTTP ni toca el cache: HTTP solo en `src/api`, cache solo
   en `src/features`.
3. Los errores del backend (`{ "error": "..." }`) se muestran tal cual: Toast para errores
   globales, texto inline en inputs ante 400 de formulario. Sin inventar mensajes.
4. Mutaciones: `disabled`/spinner mientras están en vuelo; navegación programática con
   `useNavigate` solo tras el éxito; nunca `<Link>` para crear/borrar/mover.
5. Accesible por teclado: todo botón real `<button>`, focus visible, `aria-live` en toasts.
6. Responsive móvil→escritorio; columnas en fila con scroll horizontal en móvil.

## 6. Tema claro/oscuro

- Único punto de colores: `src/styles/global.css` con variables `--bg-primary`,
  `--bg-surface`, `--text-primary`, `--accent-color`… **PROHIBIDO hardcodear hex en
  componentes/JSX.**
- Tema inicial: `@media (prefers-color-scheme: dark)`, con override persistido en
  `localStorage` bajo la clave `kanban-lite-theme`.
- El interruptor agrega/quita la clase `dark` en `<html>`. El script inline de `index.html`
  aplica el tema ANTES del render para evitar el flash.

## 7. Entorno

- La URL de la API viene EXCLUSIVAMENTE de `import.meta.env.VITE_API_URL`. Sin fallbacks a
  otras fuentes ni URLs en el código.
- `.env` no se sube (`.gitignore`); `.env.example` documentado sin credenciales.

## 8. Flujo de trabajo por fases (detenerse al final de cada una para revisión)

- **Fase 0 — Scaffold:** Vite, estructura, tokens CSS, doc de requerimientos. ✅
- **Fase 1 — Capa de servicio:** `src/api` con los 6 endpoints + ApiError con status. ✅
- **Fase 2 — Componentes atómicos:** sin `useEffect` ni API: `Button`, `TextInput`,
  `Spinner`, `Toast`, `Column`, `TicketCard`, `ConfirmDialog`.
- **Fase 3 — Vistas y rutas:** HomePage (entrada por boardId + últimos usados + crear),
  BoardDetailPage (`useParams`, carga board+columnas, rehydrator, mover con select, crear
  ticket/col, borrar col con confirmación y cascada visible).
- **Fase 4 — Movimiento con drag-and-drop nativo** (HTML drag events, sin librería) con la
  reversión optimista ante 400/404 y el caso especial del 404-duplicado (§4.1).
- **Fase 5 — Cierre:** modo demo (flujo board→columnas→tickets→mover→cascada con panel de
  request/response), dark mode toggle, atajos de teclado, README final, pruebas registradas.

Cada fase se considera terminada solo con build + prueba manual real contra el backend
corriendo (MongoDB + `npm run dev` del repo raíz). **No inventar resultados: registrar lo
observado.**

## 9. Lo que el agente NO debe hacer

- No inventar endpoints, campos (prioridad, asignados, fechas límite) ni funcionalidades
  (editar tablero/col, borrar ticket) que el backend no tenga.
- No generar componentes monolíticos ni señales de estado falsas; afirmar que algo funciona
  sin haberlo probado está prohibido. Dividir por dominio y responsabilidad.
- No mutar estado de React directamente (spread + setState); no duplicated code sin extraer.
- No navegar con `<Link>` en mutaciones; no fetch en componentes presentacionales.
- No subir `.env`, no cambiar el contrato del backend sin documentar consecuencias.
- No desarrollar todo de una vez: fase por fase con revisión.
