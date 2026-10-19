# REQUERIMIENTOS.md — Frontend Kanban Lite

Especificación técnica y funcional del frontend, adaptada de la consigna académica original
(React + Vite + SDD) al concepto **Kanban Lite** elegido por el usuario el 2026-10-19.

Fuente de las reglas de arquitectura y del flujo por fases: `../AGENTS.md`. Este documento
conserva los requerimientos de la consigna y **registra los desvíos** en §D.

---

## A. Requerimientos conservados (obligatorios)

| ID | Requerimiento | Tratamiento |
|----|---------------|-------------|
| A1 | React 18 + Vite, JavaScript/JSX | Cumple literal |
| A2 | React Router DOM 6 con experiencia SPA | Cumple; `useNavigate` solo tras mutación exitosa |
| A3 | CSS modular y variables globales para el tema | Cumple: `src/styles/global.css` (tokens) + CSS por componente |
| A4 | Estructura `src/api`, `components`, `features`, `hooks`, `pages` | Cumple |
| A5 | Separación presentacionales (solo props/UI) vs contenedores (lógica/API) | Cumple |
| A6 | Ningún fetch fuera de `src/api` | Cumple |
| A7 | Métrica visual: estados de carga, error, vacío y éxito en las vistas | Cumple |
| A8 | Toasts para errores relevantes, con el texto del contrato `{ "error": "..." }` | Cumple |
| A9 | Botones de mutación deshabilitados + spinner mientras la petición está en vuelo | Cumple |
| A10 | Formularios sin recargar la aplicación | Cumple |
| A11 | Movimiento de tickets optimista con reversión ante 400/404 + Toast | Cumple (Fase 4) |
| A12 | Evitar duplicados y actualizaciones repetidas innecesarias | Cumple: cache por columnId en el rehydrator; PATCH asigna valores finales |
| A13 | URL de la API exclusivamente desde `import.meta.env.VITE_API_URL`; `.env.example` sin credenciales | Cumple |
| A14 | Datos sintéticos separados del comportamiento real para desarrollo sin backend | Cumple: si serán necesarios, `src/mocks/mockData.js` — Fase 5 (modo demo). No se agrega MSW |
| A15 | Tema con paleta Minimalismo Developer (light/dark definidos), sin hex en componentes | Cumple: tokens en `global.css` |
| A16 | Responsive móvil→escritorio, jerarquía tipográfica clara, accesible por teclado | Cumple |
| A17 | Tema inicial por `prefers-color-scheme`, interruptor con clase global `.dark`, persistencia en `localStorage` y anti-flash | Cumple: script inline de `index.html` + hook en Fase 5 |
| A18 | SDD: requerimientos en `.md`, AGENTS.md del frontend, fases pequeñas verificables | Cumple |
| A19 | README con instalación, ejecución, integración backend, arquitectura y decisiones | Fase 5 |
| A20 | Registro real de pruebas (sin inventar resultados) | Fase 5 (modo demo sirve de evidencia) |
| A21 | Conventional Commits; no subir `.env`; no cambiar el contrato del backend sin documentar | Cumple |

## B. Funcionalidades (mapeadas al contrato real de 6 endpoints)

| Función | Endpoint usado | Nota |
|---|---|---|
| Entrar a un tablero | GET `/api/boards/:boardId` | Home pide boardId + auto-completado de últimos usados (localStorage) |
| Crear tablero (“agregar tablero”) | POST `/api/boards` | Tras el 201 → `useNavigate` al board creado |
| Columnas como líneas con 🗑 y + | GET board (columns) / POST column / DELETE column | DELETE con confirmación “esto borra N tickets” (cascada del backend); animación de la línea al desaparecer |
| Crear tickets en columna | POST tickets | 400 del backend muestreado inline en el input |
| Editar ticket (title/description) | PATCH tickets con `{title?, description?}` | `priority` NO EXISTE: no se inventa |
| Mover ticket | PATCH tickets con `{ column }` | Drag & drop nativo + fallback `<select>`; optimista con reversión |
| Feedback por HTTP | — | 201/200 verde, 404 amarillo, 400/500 rojo con `body.error` literal |
| 404 por repetición del mismo movimiento | PATCH | UX descrita en el concepto: la UI se actualiza al estado final (removiendo la copia de la columna origen) sin error; otros 404/400 sí muestran Toast |
| Modo demo end-to-end | Todos | Fase 5: reproduce el flujo de la colección Postman mostrando request/response |

## C. Requerimientos de la consigna que NO se implementan (con razón documentada)

| ID consigna | Pedía | Por qué no |
|---|---|---|
| `/login` + rutas protegidas | Login con formulario y auth | El backend no tiene auth ni modelo User. R13 indicaba analizar la incompatibilidad antes de implementar y prohibía simular autenticación segura → se opta por rutas públicas (concepto “CERO login” de Kanban Lite). Si en un futuro el backend agregaría auth, `/login` se añade sin tocar la matriz actual |
| Lista de tableros del usuario (“BoardsListPage”) | Listar boards | No existe `GET /api/boards`. La home usa boardId manual + historial localStorage. Necesidad de backend documentada |
| Visualizar tickets ya existentes al montar | Cargar tickets | No existe GET de tickets. El rehydrator cachea solo tickets de la sesión. Necesidad de backend: `GET /api/boards/:boardId/columns/:columnId/tickets` |
| Axios + TanStack Query, RHF + Zod | Stack de datos y formularios | El usuario eligió el concepto minimalista: fetch nativo + estado local + validación nativa + errores reales del contrato. Deps: solo `react`, `react-dom`, `react-router-dom` |

## D. Deuda registrada / sugerencias de backend (para discutir con el dueño del repo)

1. `GET /api/boards` y `GET .../columns/:columnId/tickets` cerrarían las dos brechas de
   visualización sin romper el diseño padre-hijo.
2. `PATCH /api/boards/:boardId/columns/:columnId` (renombrar columna) y
   `DELETE .../tickets/:ticketId` son los cruces que hoy obligan a workarounds de UI.
3. Documentado también en backend AGENTS.md §14.4: la colección Postman sigue pendiente.
