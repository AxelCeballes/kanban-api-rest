/*
 * Prueba de integración End-to-End del contrato REST kanban-api-rest.
 * Uso: node tests/demo-integracion.js [baseUrl]
 * Requiere el backend corriendo (MongoDB + npm run dev del repo raíz).
 * Registrada el 2026-10-19 como parte de la Fase integrada del frontend.
 */

const BASE = process.argv[2] ?? 'http://localhost:3000/api';

const resultados = [];

function registrar(nombre, esperado, recibido, body) {
  resultados.push({ nombre, esperado, recibido, ok: esperado === recibido, body });
  const marca = esperado === recibido ? '✓' : '✗';
  console.log(`[${marca}] ${nombre} → esperado ${esperado}, recibido ${recibido}${body ? ' | ' + JSON.stringify(body) : ''}`);
}

async function llamada(metodo, ruta, cuerpo) {
  const res = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  let data = null;
  if (res.status !== 204) {
    try { data = await res.json(); } catch { data = null; }
  }
  return { status: res.status, data };
}

async function main() {
  // 1. Crear tablero
  const { status: s1, data: board } = await llamada('POST', '/boards', { name: 'Karting Sprint (demo)' });
  registrar('POST /boards', 201, s1, board);
  const boardId = board._id;

  // 2. GET tablero nuevo (sin columnas)
  const { status: s2, data: boardLeido } = await llamada('GET', `/boards/${boardId}`);
  registrar('GET /boards/:id (vacío)', 200, s2);
  console.log('   columnas iniciales:', JSON.stringify(boardLeido.columns));

  // 3. Caso negativo: payload inválido
  const { status: s3 } = await llamada('POST', '/boards', { name: '' });
  registrar('POST /boards sin nombre (negativo)', 400, s3);

  // 4. Caso negativo: id malformado
  const { status: s4 } = await llamada('GET', '/boards/no-es-un-id');
  registrar('GET /boards con id malformado (negativo)', 400, s4);

  // 5. Columnas
  const nombres = ['Parrilla', 'En carrera', 'Bandera a cuadros'];
  const columnas = [];
  for (const nombre of nombres) {
    const { status, data } = await llamada('POST', `/boards/${boardId}/columns`, { name: nombre });
    registrar(`POST columna "${nombre}"`, 201, status);
    columnas.push(data);
  }

  // 6. Tickets
  const tickets = [];
  const datos = [
    { col: 0, title: 'Kart 01 Mango', description: 'Franco a bordo' },
    { col: 0, title: 'Kart 02 Vainilla', description: 'Pole position' },
    { col: 0, title: 'Kart 03 Turbulencia', description: '' },
  ];
  for (const { col, title, description } of datos) {
    const { status, data } = await llamada(
      'POST',
      `/boards/${boardId}/columns/${columnas[col]._id}/tickets`,
      { title, description },
    );
    registrar(`POST ticket "${title}"`, 201, status);
    tickets.push(data);
  }
  registrar('ticket sin title (negativo)', 400, (await llamada('POST', `/boards/${boardId}/columns/${columnas[0]._id}/tickets`, { title: '' })).status);

  // 7. Mover ticket 01 → "En carrera"
  const destino = columnas[1];
  const { status: s7, data: movido } = await llamada(
    'PATCH',
    `/boards/${boardId}/columns/${columnas[0]._id}/tickets/${tickets[0]._id}`,
    { column: destino._id },
  );
  registrar('PATCH mover ticket (optimista OK)', 200, s7, { column: movido.column });

  // 8. PATCH idéntico repetido → 404 documentado del contrato
  const { status: s8 } = await llamada(
    'PATCH',
    `/boards/${boardId}/columns/${columnas[0]._id}/tickets/${tickets[0]._id}`,
    { column: destino._id },
  );
  registrar('PATCH idéntico repetido (404 conocido)', 404, s8);

  // 9. Mover a columna ajena al tablero → 400 (se necesita un segundo tablero)
  const { data: boardDos } = await llamada('POST', '/boards', { name: 'Tablero ajeno' });
  const { data: colAjena } = await llamada('POST', `/boards/${boardDos._id}/columns`, { name: 'Columna ajena' });
  const { status: s9b } = await llamada(
    'PATCH',
    `/boards/${boardId}/columns/${columnas[0]._id}/tickets/${tickets[1]._id}`,
    { column: colAjena._id },
  );
  registrar('PATCH destino en otro tablero (400)', 400, s9b);

  // 10. Cascada: crear columna con ticket y borrarla (los tickets desaparecen)
  const { data: colTemp } = await llamada('POST', `/boards/${boardId}/columns`, { name: 'Box (temporal)' });
  await llamada('POST', `/boards/${boardId}/columns/${colTemp._id}/tickets`, { title: 'Ticket huérfano potencial' });
  const { status: s10 } = await llamada('DELETE', `/boards/${boardId}/columns/${colTemp._id}`);
  registrar('DELETE columna (204, cascada)', 204, s10);

  console.log('---');
  const pasan = resultados.filter((r) => r.ok).length;
  console.log(`En resumen: ${pasan}/${resultados.length} pruebas con el resultado esperado`);
  console.log(`boardId del demo: ${boardId}`);
}

main().catch((err) => {
  console.error('Fallo en la prueba:', err.message);
  process.exit(1);
});
