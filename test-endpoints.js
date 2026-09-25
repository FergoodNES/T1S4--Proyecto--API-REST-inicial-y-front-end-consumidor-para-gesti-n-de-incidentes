// test-endpoints.js
// Script automatizado de pruebas para validar todos los endpoints de la API REST

const http = require('http');

const PORT = 3000;
const HOST = 'localhost';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 INICIANDO SUITE DE PRUEBAS DE LA API REST (T1S4)');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name} -> ${err.message}`);
    }
  }

  // 1. Endpoint de estado
  await test('GET /api/estado responde 200 OK y estado activo', async () => {
    const res = await request({ host: HOST, port: PORT, path: '/api/estado', method: 'GET' });
    if (res.status !== 200 || res.body.estado !== 'activo') {
      throw new Error(`Status ${res.status}, body: ${JSON.stringify(res.body)}`);
    }
  });

  // 2. Listar incidentes
  await test('GET /api/incidentes lista los incidentes en memoria', async () => {
    const res = await request({ host: HOST, port: PORT, path: '/api/incidentes', method: 'GET' });
    if (res.status !== 200 || !Array.isArray(res.body.data) || res.body.count < 1) {
      throw new Error(`Status ${res.status}, esperados elementos en memoria`);
    }
  });

  // 3. Filtrar incidentes por estado
  await test('GET /api/incidentes?estado=Abierto filtra correctamente', async () => {
    const res = await request({ host: HOST, port: PORT, path: '/api/incidentes?estado=Abierto', method: 'GET' });
    if (res.status !== 200 || !res.body.data.every(i => i.estado === 'Abierto')) {
      throw new Error(`Falló el filtrado por estado Abierto`);
    }
  });

  // 4. Estadísticas
  await test('GET /api/incidentes/estadisticas devuelve métricas calculadas', async () => {
    const res = await request({ host: HOST, port: PORT, path: '/api/incidentes/estadisticas', method: 'GET' });
    if (res.status !== 200 || typeof res.body.data.total !== 'number') {
      throw new Error(`Falló obtención de estadísticas`);
    }
  });

  // 5. Obtener por ID existente
  await test('GET /api/incidentes/1 devuelve el detalle del incidente #1', async () => {
    const res = await request({ host: HOST, port: PORT, path: '/api/incidentes/1', method: 'GET' });
    if (res.status !== 200 || res.body.data.id !== 1) {
      throw new Error(`Falló obtención por ID`);
    }
  });

  // 6. Obtener por ID no existente (404)
  await test('GET /api/incidentes/999 devuelve 404 Not Found', async () => {
    const res = await request({ host: HOST, port: PORT, path: '/api/incidentes/999', method: 'GET' });
    if (res.status !== 404) {
      throw new Error(`Se esperaba 404, recibido ${res.status}`);
    }
  });

  // 7. Crear incidente válido (POST 201)
  let createdId = null;
  await test('POST /api/incidentes crea un nuevo incidente y responde 201 Created', async () => {
    const payload = {
      titulo: 'Falla en enlace Microondas Troncal Sur',
      descripcion: 'Alineación de antena degradada por ráfagas de viento. Pérdida del 35% de paquetes.',
      severidad: 'Alta',
      estado: 'Abierto',
      categoria: 'Red Troncal',
      asignadoA: 'Ing. Carlos Mendoza (NOC)'
    };
    const res = await request({
      host: HOST,
      port: PORT,
      path: '/api/incidentes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    if (res.status !== 201 || !res.body.data.id) {
      throw new Error(`Se esperaba 201, recibido ${res.status}`);
    }
    createdId = res.body.data.id;
  });

  // 8. Crear incidente con validaciones fallidas (POST 400)
  await test('POST /api/incidentes rechaza datos incompletos con 400 Bad Request', async () => {
    const invalidPayload = { titulo: 'No' }; // Muy corto, sin descripcion
    const res = await request({
      host: HOST,
      port: PORT,
      path: '/api/incidentes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, invalidPayload);

    if (res.status !== 400 || !res.body.messages) {
      throw new Error(`Se esperaba 400 con mensajes de validación`);
    }
  });

  // 9. Actualizar incidente (PUT 200)
  await test(`PUT /api/incidentes/${createdId} actualiza el estado y datos`, async () => {
    const updatePayload = {
      estado: 'En Progreso',
      asignadoA: 'Ing. Fernando Bermello'
    };
    const res = await request({
      host: HOST,
      port: PORT,
      path: `/api/incidentes/${createdId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, updatePayload);

    if (res.status !== 200 || res.body.data.estado !== 'En Progreso') {
      throw new Error(`Se esperaba 200 con estado actualizado`);
    }
  });

  // 10. Eliminar incidente (DELETE 200)
  await test(`DELETE /api/incidentes/${createdId} elimina el registro de memoria`, async () => {
    const res = await request({
      host: HOST,
      port: PORT,
      path: `/api/incidentes/${createdId}`,
      method: 'DELETE'
    });

    if (res.status !== 200) {
      throw new Error(`Se esperaba 200 en eliminación`);
    }

    // Confirmar que ya no existe (404)
    const checkRes = await request({ host: HOST, port: PORT, path: `/api/incidentes/${createdId}`, method: 'GET' });
    if (checkRes.status !== 404) {
      throw new Error(`El incidente aún existe tras delete`);
    }
  });

  // 11. Ruta inexistente no capturada por la API (404)
  await test('GET /ruta-desconocida responde 404 estructurado', async () => {
    const res = await request({ host: HOST, port: PORT, path: '/ruta-desconocida', method: 'GET' });
    if (res.status !== 404 || !res.body.error) {
      throw new Error(`Se esperaba 404 not found estructurado`);
    }
  });

  console.log('\n================================================================');
  console.log(`📊 RESULTADOS: ${passed} / ${total} pruebas aprobadas (${Math.round(passed/total*100)}%)`);
  console.log('================================================================\n');
}

runTests().catch(console.error);
