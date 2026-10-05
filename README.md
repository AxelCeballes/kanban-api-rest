# Kanban API REST

API RESTful estilo Kanban con jerarquía **Tablero → Columna → Ticket**, construida con Node.js, Express 5 y Mongoose 9 (MongoDB). Proyecto del Módulo 2 (Gestión de Proyectos) de FSD 2026, desarrollado con Desarrollo Basado en Especificaciones (SDD): las reglas del proyecto viven en [`AGENTS.md`](./AGENTS.md).

## Stack

- Node.js 20 o superior
- Express 5 · Mongoose 9 · dotenv · cors
- nodemon (solo desarrollo)
- MongoDB (local o Atlas)

## Instalación

```bash
git clone https://github.com/AxelCeballes/kanban-api-rest.git
cd kanban-api-rest
npm install
cp .env.example .env    # y completar los valores
npm run dev             # desarrollo, con recarga automática (nodemon)
npm start               # producción
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/kanban` |

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Inicia el servidor con nodemon |
| `npm start` | Inicia el servidor con Node |

## Endpoints

| Método | Endpoint | Acción | Éxito |
|---|---|---|---|
| POST | `/api/boards` | Crea un tablero | 201 Created |
| GET | `/api/boards/:boardId` | Obtiene un tablero con sus columnas | 200 OK |
| POST | `/api/boards/:boardId/columns` | Agrega una columna al tablero | 201 Created |
| DELETE | `/api/boards/:boardId/columns/:columnId` | Elimina una columna y sus tickets | 204 No Content |
| POST | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket en la columna | 201 Created |
| PATCH | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Actualiza o mueve un ticket | 200 OK |

No existen rutas planas como `/api/tickets`: todo ticket se crea dentro de una columna y un tablero.

### Ejemplos

**Crear un tablero**

```http
POST /api/boards
Content-Type: application/json

{ "name": "Proyecto Demo" }
```

**Obtener un tablero** (devuelve el tablero con su arreglo `columns`, sin tickets anidados)

```http
GET /api/boards/64f0c2a1b3d4e5f6a7b8c9d0
```

**Crear una columna**

```http
POST /api/boards/:boardId/columns
Content-Type: application/json

{ "name": "Qué hacer" }
```

**Crear un ticket**

```http
POST /api/boards/:boardId/columns/:columnId/tickets
Content-Type: application/json

{ "title": "Primer ticket", "description": "Opcional" }
```

**Actualizar el contenido de un ticket**

```http
PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId
Content-Type: application/json

{ "title": "Título nuevo", "description": "Descripción nueva" }
```

**Mover un ticket a otra columna del mismo tablero** (el `columnId` de la URL es la columna actual; el destino va en el body)

```http
PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId
Content-Type: application/json

{ "column": "<id de la columna destino>" }
```

El PATCH acepta únicamente `title`, `description` y `column`; cualquier otro campo se ignora.

## Reglas y códigos de error

Todos los errores responden con la forma `{ "error": "mensaje" }`.

| Situación | Código |
|---|---|
| Payload inválido (falta `name` o `title`, vacío o de tipo incorrecto) | 400 |
| ID con formato inválido (no son 24 caracteres hexadecimales) | 400 |
| Columna destino inexistente o de otro tablero al mover un ticket | 400 |
| ID válido que no existe (tablero, columna o ticket) | 404 |
| Columna que no pertenece al tablero de la URL, o ticket que no pertenece a la columna | 404 |
| Error inesperado | 500 |

- **Parent Check:** antes de operar sobre una columna se verifica que el tablero exista; antes de operar sobre un ticket, que la columna exista.
- **Aislamiento de rutas:** la columna debe pertenecer al tablero de la URL y el ticket a la columna de la URL. Un ticket solo puede moverse a columnas del mismo tablero.
- **Borrado en cascada:** eliminar una columna elimina todos sus tickets (hook `pre('deleteOne')` de documento). El modelo `Board` incluye el mismo hook para eliminar sus columnas y tickets.
- **Idempotencia:** el PATCH asigna valores finales; repetir la misma petición deja el mismo estado. Repetir un movimiento a otra columna devuelve 404 en el segundo intento, porque el ticket ya no está en la columna de la URL.

## Modelos

| Modelo | Campos |
|---|---|
| `Board` | `name` |
| `Column` | `name`, `board` (ref `Board`) |
| `Ticket` | `title`, `description`, `column` (ref `Column`), `board` (ref `Board`) |

Los hijos guardan la referencia a su padre; no hay arrays de hijos dentro de los documentos.

## Estructura del proyecto

```
src/
├── controllers/   # lógica de negocio
├── middleware/    # validateObjectId, parentCheck, errorHandler
├── models/        # Board.js, Column.js, Ticket.js
├── routes/        # mapeo URL → middleware → controlador
├── app.js         # configuración de Express
└── server.js      # conexión a MongoDB y arranque
tests/             # reservada
postman_collection.json
AGENTS.md
```

## Pruebas con Postman

1. Importar `postman_collection.json` (raíz del repositorio) en Postman (botón Import).
2. Ajustar la variable `baseUrl` si se usa otro puerto o el despliegue.
3. Ejecutar primero el flujo feliz y después los casos negativos (IDs malformados, inexistentes, columna de otro tablero, payload inválido).

## Conexión a MongoDB

- **Local:** `MONGODB_URI=mongodb://localhost:27017/kanban`.
- **Atlas:** `MONGODB_URI=mongodb+srv://USUARIO:CLAVE@cluster.xxxxx.mongodb.net/kanban?retryWrites=true&w=majority` (codificar en formato URL los caracteres especiales de la contraseña).

## Despliegue

_Agregar aquí la URL del despliegue._

## Desarrollo con SDD

El repositorio sigue el flujo de [`AGENTS.md`](./AGENTS.md): contrato y pruebas primero, y construcción por fases (datos, middleware, controladores, cierre). Los commits siguen Conventional Commits.
