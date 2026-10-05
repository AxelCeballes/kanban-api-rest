# AGENTS.md — API REST Kanban (Tableros → Columnas → Tickets)

Este archivo es la **fuente de la verdad** del proyecto. Léelo completo antes de escribir código. Si una instrucción del prompt contradice este archivo, avisa del conflicto en lugar de elegir en silencio. La sección 14 lista el estado actual y la deuda técnica conocida.

## 1. Descripción

API RESTful estilo Kanban con jerarquía Padre-Hijo-Nieto: **Board → Column → Ticket**. Sin autenticación en esta etapa (no implementarla).

## 2. Stack estricto

| Componente | Versión / librería |
|---|---|
| Runtime | Node.js 20 o superior |
| Framework | Express 5 (5.2.x) |
| ODM | Mongoose 9 (9.x) |
| Base de datos | MongoDB |
| Config | `dotenv` 18 |
| CORS | `cors` 2 |
| Desarrollo | `nodemon` (devDependency) |
| Módulos | CommonJS (`require`) |
| Tests manuales | Postman (`postman_collection.json`) |

- NO agregar dependencias sin pedirlo explícitamente (`cors` es la única extra autorizada).
- NO usar TypeScript, ORMs distintos de Mongoose ni frameworks alternativos.
- Variables de entorno en `.env` (ignorado por git) y documentadas en `.env.example`: `PORT`, `MONGODB_URI`.
- **Express 5:** `req.body` es `undefined` si la petición no trae cuerpo. Leer siempre `const body = req.body ?? {}`; nunca desestructurar `req.body` directamente.
- **Mongoose 9:** los hooks (`pre`/`post`) se escriben como funciones `async` que NO reciben ni llaman `next`. En `findOneAndUpdate` usar `{ returnDocument: 'after', runValidators: true }`.

## 3. Estructura de carpetas (la del repositorio)

```
src/
├── controllers/   # boardController.js, columnController.js, ticketController.js
├── middleware/    # validateObjectId.js, parentCheck.js (checkBoardExists, checkColumnBelongsToBoard), errorHandler.js
├── models/        # Board.js, Column.js, Ticket.js
├── routes/        # boardRoutes.js, columnRoutes.js, ticketRoutes.js
├── app.js         # Express: cors, json, montaje de routers y errorHandler
└── server.js      # carga dotenv, conecta a MongoDB y hace listen
tests/             # reservada (por ahora solo .gitkeep)
postman_collection.json   # colección de Postman (raíz del repo)
```

- NO crear carpetas ni archivos fuera de esta estructura (`utils/`, `services/`, `config/`, etc.) sin pedirlo.

## 4. Patrones de diseño

- **Responsabilidad única:** modelos = esquemas y hooks; controladores = lógica de negocio; rutas = solo mapeo URL → middleware → controlador; middleware = validaciones transversales.
- Los archivos de rutas NO contienen lógica ni consultas a la base de datos.
- Cada router se monta en `app.js` con `express.Router({ mergeParams: true })`:
  - `/api/boards` → `boardRoutes`
  - `/api/boards/:boardId/columns` → `columnRoutes`
  - `/api/boards/:boardId/columns/:columnId/tickets` → `ticketRoutes`
- Cadena estándar de middleware en cada ruta: `validateObjectId` → `checkBoardExists` → `checkColumnBelongsToBoard` (si la ruta incluye `:columnId`) → controlador.
- **Manejo de errores:** los errores esperados (400/404) se responden directamente con `return res.status(codigo).json({ error: 'mensaje' })`. Los inesperados se capturan con `try/catch` y se delegan con `next(error)` al `errorHandler` global.
- Los controladores deben reutilizar `req.board` y `req.column`, que ya dejó cargados `parentCheck`, en vez de volver a consultar la base de datos.

## 5. Modelos

- **Board:** `name` (String, requerido, trim), timestamps. Hook `pre('deleteOne', { document: true, query: false })` que elimina sus columnas llamando a `column.deleteOne()` una por una (para disparar la cascada hacia los tickets).
- **Column:** `name` (String, requerido, trim), `board` (ObjectId, ref `Board`, requerido, indexado), timestamps. Hook `pre('deleteOne', { document: true, query: false })` que elimina sus tickets.
- **Ticket:** `title` (String, requerido, trim), `description` (String, default `''`), `column` (ObjectId, ref `Column`, requerido, indexado), `board` (ObjectId, ref `Board`, requerido, indexado), timestamps.
- El hijo guarda la referencia al padre. NO se guardan arrays de hijos dentro del padre.

## 6. Contrato de la API (fuente de la verdad)

La API expone **exactamente** estas rutas. Cualquier ruta adicional debe pedirse explícitamente.

| Método | Endpoint | Acción | Éxito |
|---|---|---|---|
| POST | `/api/boards` | Crea un tablero | 201 Created |
| GET | `/api/boards/:boardId` | Obtiene un tablero con sus columnas pobladas | 200 OK |
| POST | `/api/boards/:boardId/columns` | Agrega una columna a un tablero | 201 Created |
| DELETE | `/api/boards/:boardId/columns/:columnId` | Elimina una columna y sus tickets | 204 No Content |
| POST | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket en una columna | 201 Created |
| PATCH | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Mueve un ticket o actualiza su contenido | 200 OK |

- NO crear rutas planas (`/api/tickets`, `/api/columns`). Todo ticket nace dentro de una columna y un tablero.
- `GET /api/boards/:boardId` devuelve el tablero con su arreglo `columns` (sin tickets anidados).
- Mover un ticket: el `columnId` destino viaja en el body (`{ "column": "<id>" }`) y debe pertenecer al **mismo tablero**.

## 7. Reglas de negocio y validaciones

1. **Validación de ID:** todo parámetro de ruta (`boardId`, `columnId`, `ticketId`) debe cumplir `/^[0-9a-fA-F]{24}$/`. Si no, responder `400`.
2. **Parent Check:** antes de crear una columna se verifica que el `boardId` exista; antes de crear un ticket, que la columna exista. Si no existen, `404` inmediato.
3. **Aislamiento de rutas:** `checkColumnBelongsToBoard` busca con `Column.findOne({ _id: columnId, board: boardId })`. Si la columna no existe o es de otro tablero, `404`.
4. **Payload inválido** (falta `title` o `name`, string vacío o valor que no es string): `400`.
5. **Mover ticket:** si la columna destino no existe o pertenece a otro tablero, `400` (la consigna admite 400 o 404). Si el ticket no está en la columna de la URL, `404`.
6. **Campos permitidos:** el PATCH solo acepta `title`, `description` y `column`; cualquier otro campo se ignora (en particular `_id` y `board`). Un PATCH sin campos permitidos devuelve `200` con el ticket sin cambios.
7. **Borrado en cascada:** eliminar una columna elimina sus tickets (siempre con `doc.deleteOne()`). Eliminar un tablero (si se implementa) elimina sus columnas y tickets.

## 8. Manejo de errores global

- Todo error se responde con la forma `{ "error": "mensaje" }`. Sin otras claves y sin stack traces en la respuesta.
- Un único `errorHandler` global registrado al final de `app.js`:
  - `ValidationError` y `CastError` de Mongoose → `400`.
  - Error con `statusCode` (por ejemplo, JSON malformado en el body) → ese código.
  - Cualquier otro → `500` con mensaje genérico; el detalle solo va a los logs.

| Situación | Código |
|---|---|
| Payload inválido o ID con formato incorrecto | 400 |
| ID válido que no existe, o recurso que no pertenece al padre | 404 |
| Columna destino inválida al mover un ticket | 400 |
| Error inesperado | 500 (mensaje genérico) |

## 9. Idempotencia y concurrencia

- El PATCH de ticket asigna valores finales (`title`, `description`, `column`), nunca acumula. Enviar la misma petición dos veces deja el mismo estado final, sin duplicar datos.
- Mover un ticket a la columna en la que ya está es válido y devuelve `200`.
- Repetir exactamente un movimiento a *otra* columna devuelve `404` en el segundo intento, porque el ticket ya no pertenece a la columna de la URL. Es un comportamiento aceptado y documentado.
- DELETE de una columna inexistente devuelve `404`; no debe lanzar errores ni dejar datos huérfanos.

## 10. Límites negativos (lo que NO debes hacer)

- NO devuelvas un `500` genérico cuando un `boardId` o `columnId` no existe: responde `404`.
- NO devuelvas errores de Mongoose en crudo al cliente.
- NO uses `findByIdAndDelete`, `findByIdAndRemove` ni `deleteMany` para borrar documentos que requieren cascada sin garantizar que se ejecuten los hooks. Usa `doc.deleteOne()` sobre el documento.
- NO anides tickets en arrays dentro de las columnas; usa referencias (`ObjectId`).
- NO pongas consultas a la base de datos en los archivos de rutas.
- NO uses `mongoose.isValidObjectId()` como único chequeo de formato (acepta strings de 12 caracteres).
- NO desestructures `req.body` sin el `?? {}` (Express 5).
- NO asumas que `name`, `title` o `column` son strings: valida el tipo antes de llamar a `.trim()` o de usarlos en una consulta.
- NO uses `next` en los hooks de Mongoose ni patrones de Express 4 / Mongoose 8.
- NO implementes autenticación, paginación, WebSockets ni funcionalidades que no estén en este documento.
- NO modifiques modelos o contratos ya aprobados para "arreglar" un test: reporta el conflicto.
- NO generes todo en un solo paso (ver sección 11).

## 11. Flujo de trabajo (partición generativa)

Trabaja por fases y detente al final de cada una para revisión:

0. **Contrato:** `postman_collection.json` generado a partir de la tabla de la sección 6, incluyendo casos negativos (ID malformado, ID inexistente, columna de otro tablero, payload sin título, body ausente, PATCH repetido dos veces).
1. **Datos:** esquemas de Mongoose, referencias, índices y cascada.
2. **Middleware:** `validateObjectId`, `parentCheck` y `errorHandler`.
3. **Controladores y rutas:** un endpoint por vez, en el orden de la tabla.
4. **Cierre:** README, `.env.example`, pruebas finales con la colección y despliegue.

Cada fase se considera terminada solo cuando las peticiones correspondientes de la colección pasan.

## 12. Convenciones

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Un cambio lógico por commit.
- **Código:** `const`/`let`, `async/await`, nombres en inglés para código y rutas, mensajes de error en español, 2 espacios de indentación.
- **README.md** debe incluir: descripción, requisitos, instalación, variables de entorno, scripts, tabla de endpoints con ejemplos y códigos de respuesta, y enlace al despliegue (si existe).
- Respuestas JSON siempre; `204` sin cuerpo.

## 13. Definición de terminado

- [ ] Los 6 endpoints responden con el código de éxito de la tabla.
- [ ] Todos los casos negativos de la colección devuelven `{ "error": "..." }` con el código correcto.
- [ ] Borrar una columna elimina sus tickets (verificado en la base de datos).
- [ ] Un ticket no puede accederse ni moverse por fuera de su tablero.
- [ ] Ninguna petición mal formada (sin body, tipos incorrectos, JSON inválido) produce un `500`.
- [ ] `.env.example`, README y `postman_collection.json` completos; repositorio público con Conventional Commits.

## 14. Estado actual y deuda técnica conocida

Fases 1 a 3 implementadas. Pendiente, en orden de prioridad:

1. **Body ausente → 500.** En Express 5, un POST/PATCH sin cuerpo deja `req.body` en `undefined` y la desestructuración lanza `TypeError`. Debe ser `400`.
2. **Tipos no string → 500.** `name.trim()` y `title.trim()` fallan si el valor es número, objeto o arreglo. Validar `typeof === 'string'`. Hacer lo mismo con `column` en el PATCH antes de usarlo en `Column.findOne` (evita que se cuelen operadores como `{ "$ne": null }`).
3. **Hooks con `next`.** Los `pre('deleteOne')` de `Board` y `Column` reciben y llaman `next`; en Mongoose 9 esto debe quitarse. Verificar el DELETE de columna contra la base de datos.
4. **Rutas inexistentes.** Devuelven el HTML por defecto de Express; falta un 404 JSON `{ error }` antes del `errorHandler`.
5. **`server.js`.** Si falla la conexión, solo loguea y el proceso termina con código 0; debe hacer `process.exit(1)`. Además, la URI por defecto (`kanban_db`) no coincide con `.env.example` (`kanban`).
6. **`errorHandler`.** Loguea el stack de todos los errores, incluidos los 400; limitarlo a los 500.
7. **Consultas repetidas.** `getBoardById` y `deleteColumn` vuelven a buscar lo que `parentCheck` ya cargó en `req.board` / `req.column`.
8. **Entregables faltantes:** `postman_collection.json` no está en el repo y el README estaba vacío. Corregir también `package.json` (`main` apunta a `index.js`, `description` vacía).
