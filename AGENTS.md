# AGENTS.md — API REST Kanban (Tableros → Columnas → Tickets)

Este archivo es la **fuente de la verdad** del proyecto. Léelo completo antes de escribir código. Si una instrucción del prompt contradice este archivo, avisa del conflicto en lugar de elegir en silencio.

## 1. Descripción

API RESTful estilo Kanban con jerarquía Padre-Hijo-Nieto: **Board → Column → Ticket**. Sin autenticación en esta etapa (no implementarla).

## 2. Stack estricto

| Componente | Versión / librería |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| ODM | Mongoose 8 |
| Base de datos | MongoDB |
| Config | `dotenv` |
| Módulos | CommonJS (`require`) |
| Tests manuales | ThunderClient (`thunder-collection.json`) |

- NO agregar dependencias sin pedirlo explícitamente.
- NO usar TypeScript, ORMs distintos de Mongoose ni frameworks alternativos.
- Variables de entorno en `.env` (ignorado por git) y documentadas en `.env.example`: `PORT`, `MONGODB_URI`.

## 3. Estructura de carpetas

```
src/
├── config/        # conexión a la base de datos
├── models/        # Board.js, Column.js, Ticket.js
├── controllers/   # boardController.js, columnController.js, ticketController.js
├── routes/        # boardRoutes.js, columnRoutes.js, ticketRoutes.js
├── middlewares/   # validateObjectId, loadBoard, loadColumn, errorHandler
└── app.js         # configuración de Express
server.js          # arranque (listen)
```

## 4. Patrones de diseño

- **Responsabilidad única:** modelos = esquemas y hooks; controladores = lógica de negocio; rutas = solo mapeo URL → middlewares → controlador; middlewares = validaciones transversales.
- Los archivos de rutas NO contienen lógica ni consultas a la base de datos.
- Los controladores son `async` y delegan errores con `next(err)`; no repiten `try/catch` con respuestas manuales de error.
- Rutas anidadas con `express.Router({ mergeParams: true })`.

## 5. Modelos

- **Board:** `name` (String, requerido, trim), timestamps.
- **Column:** `name` (String, requerido, trim), `board` (ObjectId, ref `Board`, requerido, indexado), timestamps.
- **Ticket:** `title` (String, requerido, trim), `description` (String, opcional), `column` (ObjectId, ref `Column`, requerido, indexado), `board` (ObjectId, ref `Board`, requerido, indexado), timestamps.
- El hijo guarda la referencia al padre. NO se guardan arrays de hijos dentro del padre.

## 6. Contrato de la API (fuente de la verdad)

La API expone **exactamente** estas rutas. Cualquier ruta adicional debe pedirse explícitamente.

| Método | Endpoint | Acción | Éxito |
|---|---|---|---|
| POST | `/api/boards` | Crea un tablero | 201 Created |
| GET | `/api/boards/:boardId` | Obtiene un tablero con sus columnas pobladas | 200 OK |
| POST | `/api/boards/:boardId/columns` | Agrega una columna a un tablero | 201 Created |
| DELETE | `/api/boards/:boardId/columns/:columnId` | Elimina una columna | 204 No Content |
| POST | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket en una columna | 201 Created |
| PATCH | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Mueve un ticket o actualiza su contenido | 200 OK |

- NO crear rutas planas (`/api/tickets`, `/api/columns`). Todo ticket nace dentro de una columna y un tablero.
- Mover un ticket: el `columnId` destino viaja en el body (`{ "column": "<id>" }`) y debe pertenecer al **mismo tablero**.

## 7. Reglas de negocio y validaciones

1. **Validación de ID:** todo parámetro de ID debe cumplir `/^[0-9a-fA-F]{24}$/`. Si no, responder `400`.
2. **Parent Check:** antes de crear una columna se verifica que el `boardId` exista; antes de crear un ticket, que exista el `columnId`. Si no existen, `404` inmediato.
3. **Aislamiento de rutas:** en `/api/boards/:boardId/columns/:columnId/...` se valida que la columna pertenezca al tablero (`Column.findOne({ _id: columnId, board: boardId })`). Si no, `404`.
4. **Payload inválido** (ej. falta `title` o `name`, strings vacíos): `400`.
5. **Borrado en cascada:** eliminar una columna elimina sus tickets. Eliminar un tablero (si se implementa) elimina sus columnas y tickets.
6. **Campos permitidos:** el PATCH solo acepta `title`, `description` y `column`. Ignorar o rechazar cualquier otro campo (en particular `_id` y `board`).

## 8. Manejo de errores global

- Todo error se responde con la forma `{ "error": "mensaje" }`. Sin otras claves y sin stack traces.
- Un único `errorHandler` global registrado al final de `app.js`.
- Mapeo de códigos:

| Situación | Código |
|---|---|
| Payload inválido o ID con formato incorrecto | 400 |
| ID válido que no existe, o recurso que no pertenece al padre | 404 |
| Error inesperado | 500 (mensaje genérico, detalle solo en logs) |

- `ValidationError` y `CastError` de Mongoose se capturan en el `errorHandler` y se traducen a `400`.

## 9. Idempotencia y concurrencia

- El PATCH de ticket usa semántica de **asignación** (`$set` de valores finales), nunca de acumulación. Enviar la misma petición dos veces debe dejar el mismo estado final, sin duplicar datos.
- Mover un ticket a la columna en la que ya está es una operación válida y devuelve `200` con el ticket sin cambios.
- DELETE de una columna inexistente devuelve `404`; no debe lanzar errores ni dejar datos huérfanos.

## 10. Límites negativos (lo que NO debes hacer)

- NO devuelvas un `500` genérico cuando un `boardId` o `columnId` no existe: captura la condición y responde `404`.
- NO devuelvas errores de Mongoose en crudo al cliente.
- NO uses `findByIdAndDelete`, `findByIdAndRemove` ni `deleteMany` para borrar documentos que requieren cascada sin garantizar que se ejecuten los hooks. Usa `doc.deleteOne()` sobre el documento o ejecuta la cascada explícitamente en el controlador.
- NO anides tickets en arrays dentro de las columnas; usa referencias (`ObjectId`).
- NO pongas consultas a la base de datos en los archivos de rutas.
- NO uses `mongoose.isValidObjectId()` como único chequeo de formato (acepta strings de 12 caracteres).
- NO implementes autenticación, paginación, WebSockets ni funcionalidades que no estén en este documento.
- NO modifiques modelos o contratos ya aprobados para "arreglar" un test: reporta el conflicto.
- NO generes todo en un solo paso (ver sección 11).

## 11. Flujo de trabajo (partición generativa)

Trabaja por fases y detente al final de cada una para revisión:

0. **Contrato:** generar `thunder-collection.json` a partir de la tabla de la sección 6, incluyendo casos negativos (ID malformado, ID inexistente, columna de otro tablero, payload sin título, PATCH repetido dos veces).
1. **Datos:** esquemas de Mongoose, referencias e índices, y la cascada.
2. **Middlewares:** validación de ObjectId, Parent Check, pertenencia columna-tablero y `errorHandler`.
3. **Controladores y rutas:** un endpoint por vez, en el orden de la tabla.
4. **Cierre:** README, `.env.example` y pruebas finales con la colección.

Cada fase se considera terminada solo cuando las peticiones correspondientes de la colección pasan.

## 12. Convenciones

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Un cambio lógico por commit.
- **Código:** `const`/`let`, `async/await`, nombres en inglés para código y rutas, 2 espacios de indentación.
- **README.md** debe incluir: descripción, requisitos, instalación, variables de entorno, scripts, tabla de endpoints con ejemplos y códigos de respuesta, y enlace al despliegue (si existe).
- Respuestas JSON siempre; `204` sin cuerpo.

## 13. Definición de terminado

- [ ] Los 6 endpoints responden con el código de éxito de la tabla.
- [ ] Todos los casos negativos de la colección devuelven `{ "error": "..." }` con el código correcto.
- [ ] Borrar una columna elimina sus tickets (verificado en la base de datos).
- [ ] Un ticket no puede accederse ni moverse por fuera de su tablero.
- [ ] `.env.example` y README completos; repositorio público con Conventional Commits.
