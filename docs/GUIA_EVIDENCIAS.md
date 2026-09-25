# GUÍA DE EJECUCIÓN, PRUEBAS Y CAPTURAS DE EVIDENCIA (T1S4)

**Proyecto:** API REST inicial y front-end consumidor para gestión de incidentes  
**Asignatura:** Redes de Plataforma  
**Estudiante:** Fernando Bermello  

---

## 1. Requisitos Previos y Entorno
- **Node.js:** v18.0 o superior (Instalado y configurado en el sistema).
- **NPM:** Gestor de paquetes oficial.
- **Navegador Web:** Chrome, Edge, Firefox u Opera.

---

## 2. Instrucciones para Iniciar el Servidor

1. Abra una terminal (PowerShell o CMD) en la raíz del proyecto (`D:\Documents\REDES DE PLATAFORMA`).
2. Si es la primera vez o requiere dependencias:
   ```bash
   npm install
   ```
3. Inicie el servidor Express:
   ```bash
   npm start
   ```
   *(También puede ejecutar `node server.js` o `node servidor.js`)*.
4. Verifique que la terminal muestre el banner de bienvenida:
   ```text
   ================================================================
   🚀 Sistema de Gestión de Incidentes - Redes de Plataforma
   📡 Servidor Express iniciado y escuchando en:
      ➜ Local:   http://localhost:3000
      ➜ API:     http://localhost:3000/api/incidentes
      ➜ Estado:  http://localhost:3000/api/estado
   ================================================================
   ```

---

## 3. Acceso a la Interfaz Web (Front-End Consumidor)

Abra su navegador web e ingrese a:
👉 **`http://localhost:3000`**

### Funcionalidades que debe probar y capturar:
1. **Vista General del Dashboard (Captura 1):**
   - Tarjetas KPI con contadores en tiempo real (Total, Abiertos, En Progreso, Resueltos, Críticos).
   - Indicador de estado de la API (`En Línea` con latencia en milisegundos).
   - Listado de incidentes precargados con etiquetas visuales de severidad y estado.
   - Panel lateral derecho: "Inspector de Tráfico Fetch REST" mostrando las peticiones GET iniciales.

2. **Búsqueda y Filtrado Dinámico (Captura 2):**
   - Escriba en la caja de búsqueda (ej. `fibra` o `VPN`).
   - Pruebe los selectores desplegables:
     - Filtre por Estado: `En Progreso` o `Abierto`.
     - Filtre por Severidad: `Crítica` o `Alta`.
   - Observe cómo el front-end actualiza el listado y el inspector lateral registra las peticiones con query params (`?estado=...`).

3. **Creación de Nuevo Incidente (Captura 3):**
   - Haga clic en el botón superior **`+ Nuevo Incidente`**.
   - Diligencie el formulario modal (Título, Categoría, Severidad, Estado, Asignado y Descripción).
   - Haga clic en **`Registrar Incidente`**.
   - Observe la notificación flotante (Toast) de éxito y el nuevo registro al inicio de la lista.

4. **Detalle de Incidente y Carga Útil JSON (Captura 4):**
   - En cualquier tarjeta de incidente, presione el botón **`Detalle`**.
   - Se abrirá la ventana modal con la información técnica y el bloque de código con la respuesta JSON cruda devuelta por `GET /api/incidentes/:id`.

5. **Actualización Rápida de Estado (Captura 5):**
   - En la tarjeta de cualquier incidente, use el selector rápido superior derecho y cambie el estado (ej. de `Abierto` a `En Progreso` o `Resuelto`).
   - Los contadores de KPIs se recalculan automáticamente.

6. **Eliminación de Incidente (Captura 6):**
   - Presione el botón **`Eliminar`** en alguna tarjeta y confirme el diálogo.
   - El incidente desaparece de memoria y el panel de auditoría registra la solicitud `DELETE`.

---

## 4. Ejecución de la Suite Automatizada de Pruebas (Captura 7)

En una segunda terminal, con el servidor corriendo, ejecute:
```bash
node test-endpoints.js
```
El script ejecutará 11 pruebas automatizadas cubriendo:
- `GET /api/estado` (200 OK)
- `GET /api/incidentes` (200 OK)
- `GET /api/incidentes?estado=Abierto` (Filtros)
- `GET /api/incidentes/estadisticas` (KPIs)
- `GET /api/incidentes/:id` (Búsqueda por ID)
- `GET /api/incidentes/999` (Manejo 404)
- `POST /api/incidentes` (Creación 201)
- `POST /api/incidentes` (Validación de errores 400 Bad Request)
- `PUT /api/incidentes/:id` (Actualización 200)
- `DELETE /api/incidentes/:id` (Eliminación 200)
- `GET /ruta-desconocida` (Manejo de rutas 404 globales)

Resultado esperado:
```text
================================================================
📊 RESULTADOS: 11 / 11 pruebas aprobadas (100%)
================================================================
```

---

## 5. Captura del Middleware de Registro en Terminal (Captura 8)

Observe la terminal donde está corriendo `server.js`. Verá los logs en tiempo real formateados por el middleware `logger.js`:
```text
[REGISTRO] 2026-09-25 14:47:35 | GET    | [200] | /api/incidentes | IP: ::1 | 1ms
[REGISTRO] 2026-09-25 14:47:35 | POST   | [201] | /api/incidentes | IP: ::1 | 1ms
[REGISTRO] 2026-09-25 14:47:35 | POST   | [400] | /api/incidentes | IP: ::1 | 1ms
[REGISTRO] 2026-09-25 14:47:35 | PUT    | [200] | /api/incidentes/7 | IP: ::1 | 1ms
[REGISTRO] 2026-09-25 14:47:35 | DELETE | [200] | /api/incidentes/7 | IP: ::1 | 0ms
[REGISTRO] 2026-09-25 14:47:35 | GET    | [404] | /ruta-desconocida | IP: ::1 | 0ms
```

---

## 6. Generación del Archivo de Entrega (.zip)

Puede comprimir la carpeta del proyecto (excluyendo `node_modules` para optimizar peso) o utilizar el script automatizado provisto en el proyecto:
```bash
node package-submission.js
```
El archivo ZIP resultante contendrá el código fuente, la documentación técnica y la estructura requerida para la plataforma virtual de entrega.
