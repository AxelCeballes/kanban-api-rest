# Requerimientos: frontend Kanban
Especificación de la consigna académica (React + Vite) integrada al backend kanban-api-rest.
Fuentes: PDF "FRONTEND - Buenas prácticas y SDD" y el prompt de la consigna.
Cómo leerlo. Los requerimientos con ID R son obligatorios (el PDF o el prompt los formula con "debe", "exigir", "prohibido" o "fijar la regla"). Los que llevan ID G son recomendaciones o ejemplos del PDF, no vinculantes. Un requerimiento solo se da por cumplido con evidencia (build, prueba o verificación real).[cite: 1]

## 1. Stack tecnológico
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R1 | React 18 o superior y Vite. | PDF, prompt[cite: 1] |
| R2 | React Router DOM v6 o superior, con experiencia SPA sin recargas innecesarias. | PDF, prompt[cite: 1] |
| R3 | Axios para HTTP y TanStack Query para datos y sincronización. | PDF, prompt[cite: 1] |
| R4 | React Hook Form + Zod para formularios. | PDF, prompt[cite: 1] |
| R5 | CSS modular y variables CSS globales para los temas; JavaScript y JSX. | Prompt[cite: 1] |
| R6 | Dependencias al mínimo y compatibles entre si; el stack debe ser coherente con el del backend (Express 5 + Mongoose 9). | PDF, prompt[cite: 1] |

## 2. Arquitectura y patrón de componentes
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R7 | Estructura: `src/api` (llamadas REST aisladas), `src/components` (UI reutilizable), `src/features` (módulos por dominio: boards, columns, tickets), `src/hooks`, `src/pages`, `src/routes`. | PDF, prompt[cite: 1] |
| R8 | Separación estricta: componentes presentacionales (solo props y UI) vs contenedores/páginas (lógica, API y estado). | PDF[cite: 1] |
| R9 | Ninguna petición HTTP dentro de componentes puramente visuales; todas centralizadas en servicios de `src/api`. | PDF, prompt[cite: 1] |
| R10 | Sin componentes gigantes ni archivos con responsabilidades incompatibles ni código duplicado. | PDF, prompt[cite: 1] |

## 3. Rutas y navegación
| Ruta | Descripción | Componente | Acceso |
| :--- | :--- | :--- | :--- |
| `/login` | Formulario de autenticación | `LoginPage` | Público[cite: 1] |
| `/boards` | Lista de tableros del usuario | `BoardsListPage` | Protegido[cite: 1] |
| `/boards/:boardId` | Vista Kanban; carga columnas y tickets anidados | `BoardDetailPage` | Protegido[cite: 1] |

| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R11 | Implementar la matriz de rutas de arriba, con protección de rutas en `src/routes`. | PDF, prompt[cite: 2] |
| R12 | No usar `<Link>` para mutaciones (crear, borrar, mover). Usar navegación programática (`useNavigate`) solo después de que la mutación haya sido exitosa. | PDF, prompt[cite: 2] |
| R13 | El backend original no exige autenticación: analizar la incompatibilidad antes de implementar el login; si hacen falta endpoints de auth, documentar los cambios y no simular una autenticación segura. | Prompt[cite: 2] |

## 4. Funcionalidades Kanban
*(Nota: Las relaciones Board → Column → Ticket se respetan siempre. Se usan solo las operaciones que soporte el contrato REST; lo que no exista en el backend se documenta como necesidad de nuevo endpoint antes de implementarlo).*[cite: 2]

| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R14 | Crear y visualizar tableros. | Prompt[cite: 2] |
| R15 | Visualizar columnas y tickets de un tablero. | PDF, prompt[cite: 2] |
| R16 | Crear columnas dentro de un tablero y eliminar columnas. | Prompt[cite: 2] |
| R17 | Crear tickets dentro de una columna, actualizarlos y moverlos entre columnas. | Prompt[cite: 2] |
| R18 | No inventar endpoints, propiedades ni funcionalidades que el backend no tenga (por ejemplo, el ticket solo tiene `title` y `description`). | Prompt[cite: 2] |

## 5. Formularios y estados de interfaz
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R19 | Validación en cliente con React Hook Form + Zod (o Yup), mostrando los errores de validación. | PDF, prompt[cite: 2] |
| R20 | Los errores HTTP del backend (por ejemplo 400) se mapean a las alertas visuales de los inputs sin recargar la página. | PDF, prompt[cite: 2] |
| R21 | Todo formulario con POST, PATCH o DELETE debe deshabilitar el botón (`disabled={isSubmitting}`) y mostrar un indicador (spinner) mientras la petición está en curso. | PDF[cite: 2] |
| R22 | Estados de carga, error, vacío y éxito en las vistas. | Prompt[cite: 2] |
| R23 | Mensajes Toast para errores relevantes. | Prompt[cite: 2] |
| R24 | Los formularios funcionan sin recargar la aplicación. | Prompt[cite: 2] |

## 6. Sincronización: movimiento de tickets (Optimistic UI)
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R25 | Al mover un ticket (`PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId`) aplicar actualización optimista en el estado local. | PDF, prompt[cite: 3] |
| R26 | Si el backend responde con error (400 o 404), revertir el ticket a su columna original y mostrar un Toast con el fallo. | PDF, prompt[cite: 3] |
| R27 | Si la petición funciona, sincronizar el estado con el servidor. | Prompt[cite: 3] |
| R28 | Evitar tickets duplicados, inconsistencias de estado y actualizaciones repetidas innecesarias. | Prompt[cite: 3] |
*(Nota del backend: el `columnId` de la URL es la columna actual y el destino va en el body `({ "column": id })`; repetir el mismo movimiento da 404).*[cite: 3]

## 7. Integración dengan backend, entorno y mocks
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R29 | La URL de la API se obtiene exclusivamente de `import.meta.env.VITE_API_URL`; crear `.env.example` (sin credenciales). | PDF, prompt[cite: 3] |
| R30 | Generar datos sintéticos (`mockData.js`) o usar MSW basados en el contrato real, claramente separados del comportamiento real. | PDF, prompt[cite: 3] |
| R31 | La entrega final debe funcionar conectada al backend real. | Prompt[cite: 3] |
| R32 | Analizar el repositorio real (endpoints, modelos, respuestas) y detectar incompatibilidades antes de codificar. | Prompt[cite: 3] |

## 8. Diseño visual: Minimalismo Developer
*(Estilo IDE/terminal, prioriza contraste y jerarquía sobre lo decorativo)*[cite: 3].
* **Fondo:** Light `#F9FAFB` (gris hielo) | Dark `#0F172A` (azul medianoche)[cite: 3]
* **Tarjetas:** Light `#FFFFFF` | Dark `#1E293B`[cite: 3]
* **Texto principal:** Light `#111827` (pizarra oscuro) | Dark `#F8FAFC` (gris muy claro)[cite: 3]
* **Acento:** Light `#4F46E5` (indigo) | Dark `#818CF8` (indigo suave)[cite: 3]

| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R33 | Usar las paletas anteriores. | PDF, prompt[cite: 3] |
| R34 | Responsive desde móvil hasta escritorio; consistente; jerarquía tipográfica clara; sin decoración innecesaria. | Prompt[cite: 3] |
| R35 | Accesible por teclado y con componentes reutilizables. | Prompt[cite: 3] |

## 9. Theme switch Light/Dark
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R36 | Variables CSS globales (por ejemplo `--bg-primary`, `--text-primary`, `--accent-color`). Prohibido hardcodear colores hexadecimales en los componentes. | PDF, prompt[cite: 3] |
| R37 | Leer inicialmente `@media (prefers-color-scheme: dark)` para adoptar el tema del sistema. | PDF, prompt[cite: 3] |
| R38 | Interruptor manual Light/Dark que inyecta una clase global (por ejemplo `.dark`) en `<html>` o `<body>`. | PDF, prompt[cite: 3] |
| R39 | Persistir la elección en `localStorage` y aplicar el tema desde el inicio para evitar el parpadeo de estilos. | PDF, prompt[cite: 3] |

## 10. Desarrollo Basado en Especificaciones (SDD)
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R40 | Crear un archivo `.md` con todos los requerimientos funcionales y técnicos (este documento) y asegurar que el agente lo lea y lo respete. | PDF, prompt[cite: 3] |
| R41 | Crear o adaptar el `AGENTS.md` del frontend: reglas de arquitectura, tecnologías, restricciones, convenciones y qué NO debe hacer el agente. | PDF, prompt[cite: 3] |
| R42 | Desarrollar por fases pequeñas y verificables, revisando el cumplimiento al terminar cada una: Fase 1 capa de servicio API; Fase 2 componentes atómicos tontos (sin `useEffect` ni llamadas a API); Fase 3 integración de vistas y rutas (`useParams`, estados loading/error/data). | PDF, prompt[cite: 3] |
| R43 | No desarrollar toda la aplicación de una sola vez sin revisiones intermedias. | Prompt[cite: 4] |

## 11. Documentación, repositorios y despliegue
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R44 | `README.md` completo del frontend: instalación, ejecución, integración con el backend, arquitectura y decisiones técnicas (frameworks y librerías). | PDF, prompt[cite: 4] |
| R45 | Documento `.md` equivalente para el backend con sus decisiones de arquitectura. | PDF[cite: 4] |
| R46 | Registro de las pruebas realizadas (sin inventar resultados) y documentación de despliegue. | Prompt[cite: 4] |
| R47 | Actualizar los repositorios y desplegar frontend y backend verificando que funcionen juntos. Sin permisos sobre el repo original: preparar los cambios por separado e indicar cómo integrarlos. No declarar un despliegue exitoso sin verificarlo. | PDF, prompt[cite: 4] |

## 12. Git y buenas prácticas
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R48 | Conventional Commits. | Prompt[cite: 4] |
| R49 | No sobrescribir trabajo existente ni eliminar funcionalidades sin justificación. | Prompt[cite: 4] |
| R50 | No subir archivos `.env` con credenciales. | Prompt[cite: 4] |
| R51 | No cambiar el contrato del backend sin explicar las consecuencias. | Prompt[cite: 4] |

## 13. Validación final (con evidencia)
| ID | Requerimiento | Fuente |
| :--- | :--- | :--- |
| R52 | Compila correctamente y pasan las verificaciones disponibles. | Prompt[cite: 4] |
| R53 | Probar rutas, formularios y validaciones. | Prompt[cite: 4] |
| R54 | Comprobar la integración con el backend, el movimiento de tickets y la reversión ante errores. | Prompt[cite: 4] |
| R55 | Revisar responsive, Light Mode y Dark Mode. | Prompt[cite: 4] |
| R56 | Revisar el cumplimiento de todos los puntos del PDF y documentar los problemas pendientes. | Prompt[cite: 4] |

## 14. Recomendaciones y ejemplos (no vinculantes)
| ID | Recomendación o ejemplo del PDF | Tratamiento |
| :--- | :--- | :--- |
| G1 | Alternativa de estado: Axios + Context API en lugar de TanStack Query. | Se usa TanStack Query (R3)[cite: 4] |
| G2 | Prompts modelo de cada fase (`boardService.js`, `TicketCard.jsx`, `BoardDetailPage.jsx`). | Guía de las fases de R42[cite: 4] |
| G3 | Hooks de ejemplo `useAuth` y `useFetch`. | Según lo que necesite la implementación[cite: 4] |
| G4 | Ejemplo `TicketCard` con campo `priority`. | No existe en el backend: no se inventa[cite: 4] |
| G5 | Ejemplo de error 400 por título duplicado. | El backend no lo valida; se mapean los 400 reales[cite: 4] |
| G6 | Usar Tailwind, Bootstrap u otro en lugar de CSS propio. | Se usa CSS modular (R5)[cite: 4] |
| G7 | Mock Service Worker en lugar de `mockData.js`. | A elegir entre ambos (R30)[cite: 4] |
| G8 | Especificar si las mutaciones son optimistas o estándar. | Optimista para mover tickets (R25)[cite: 4] |

## 15. Límites negativos: lo que el agente NO debe hacer
* No usar `<Link>` para crear, borrar o mover tickets.[cite: 4]
* No mezclar peticiones HTTP ni `useEffect` de API dentro de componentes presentacionales.[cite: 4]
* No generar componentes gigantes ni archivos con responsabilidades incompatibles.[cite: 4]
* No hardcodear colores hexadecimales en componentes; no leer la URL del backend de otra fuente que `VITE_API_URL`.[cite: 4]
* No inventar endpoints, propiedades, funciones de edición o eliminación que el backend no tenga.[cite: 4]
* No simular una autenticación segura; no afirmar que algo funciona sin probarlo ni inventar resultados de pruebas.[cite: 4]
* No declarar un despliegue exitoso sin verificarlo; no modificar ni publicar el repo original sin permisos.[cite: 4]
* No cambiar el contrato del backend sin documentar las consecuencias; no subir `.env`; no agregar dependencias innecesarias.[cite: 4]
* No desarrollar toda la aplicación de una sola vez sin revisiones intermedias.[cite: 4]