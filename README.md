# Proyecto T1S4: API REST Inicial y Front-End Consumidor para Gestión de Incidentes

**Asignatura:** Redes de Plataforma  
**Unidad 4:** Node.js, Express, estructura de proyecto, CRUD, middleware, REST, componentes e integración con APIs  
**Estudiante:** Fernando Bermello  
**Fecha:** Septiembre 2026  

[![Live Demo](https://img.shields.io/badge/Render-Live%20Demo-brightgreen?logo=render)](https://t1s4-proyecto-api-rest-inicial-y-front.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/FergoodNES/T1S4--Proyecto--API-REST-inicial-y-front-end-consumidor-para-gesti-n-de-incidentes)

- 🌐 **Demo en Vivo en Internet:** [https://t1s4-proyecto-api-rest-inicial-y-front.onrender.com/](https://t1s4-proyecto-api-rest-inicial-y-front.onrender.com/)
- 🐙 **Repositorio GitHub:** [https://github.com/FergoodNES/T1S4--Proyecto--API-REST-inicial-y-front-end-consumidor-para-gesti-n-de-incidentes](https://github.com/FergoodNES/T1S4--Proyecto--API-REST-inicial-y-front-end-consumidor-para-gesti-n-de-incidentes)

---

## 📋 Descripción del Proyecto
Este proyecto implementa una solución completa para la monitorización y despacho de incidencias técnicas en plataformas de red y telecomunicaciones. Cuenta con:
1. **API RESTful desarrollada con Express y Node.js:** Implementación modular bajo el patrón MVC, soporte CRUD completo, validaciones estrictas, modelo en memoria volátil, middleware de registro con cálculo de latencia y manejo centralizado de errores (400, 404, 500).
2. **Front-End Consumidor Moderno:** Panel interactivo en tiempo real tipo Dashboard NOC con diseño oscuro glassmorphism, métricas estadísticas (KPIs), filtros dinámicos multinivel (estado, severidad, categoría y búsqueda en tiempo real), modales de creación/edición, visualizador de payload JSON crudo e inspector lateral del flujo de peticiones Fetch.
3. **Documentación y Justificación Técnica:** Ensayo técnico riguroso de 717 palabras (cumpliendo el rango de 600-800 palabras requerido por la rúbrica) ubicado en `docs/JUSTIFICACION_TECNICA.md`.
4. **Suite Automatizada de Pruebas:** 11 pruebas de extremo a extremo en `test-endpoints.js`.

---

## 📂 Estructura del Proyecto
```text
REDES DE PLATAFORMA/
├── package.json                   # Dependencias y scripts de ejecución
├── server.js                      # Punto de entrada principal Express
├── servidor.js                    # Enlace de compatibilidad con T1S3
├── test-endpoints.js              # Suite de pruebas automatizadas
├── package-submission.js          # Script para empaquetar entrega ZIP
├── src/
│   ├── app.js                     # Configuración de Express, middlewares y rutas
│   ├── config/
│   │   └── config.js              # Variables de configuración y constantes
│   ├── middlewares/
│   │   ├── logger.js              # Middleware de registro con timestamp, IP y latencia
│   │   └── errorHandler.js        # Manejo centralizado de errores y rutas no encontradas (404/500)
│   ├── models/
│   │   └── incidentModel.js       # Modelo en memoria con persistencia en runtime y KPIs
│   ├── controllers/
│   │   └── incidentController.js  # Lógica de negocio, validaciones y respuestas HTTP
│   └── routes/
│       └── incidentRoutes.js      # Definición de rutas REST (/api/incidentes)
├── public/                        # Front-End consumidor servido estáticamente
│   ├── index.html                 # Estructura semántica accesible y modales
│   ├── css/
│   │   └── style.css              # Sistema de diseño Cyber-Ops moderno y responsivo
│   └── js/
│       └── app.js                 # Consumo asíncrono Fetch, manejo de estado y eventos
└── docs/
    ├── JUSTIFICACION_TECNICA.md   # Justificación técnica formal (600 - 800 palabras)
    └── GUIA_EVIDENCIAS.md         # Paso a paso para ejecución y toma de capturas
```

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Iniciar el Servidor Backend
Abra una terminal en esta carpeta y ejecute:
```bash
npm start
```
El servidor arrancará en: **`http://localhost:3000`**

### 2. Abrir la Interfaz de Usuario
Abra su navegador web y visite:
👉 **`http://localhost:3000`**

### 3. Ejecutar las Pruebas Automatizadas
En otra terminal ejecute:
```bash
node test-endpoints.js
```

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/estado` | Verifica el estado del servicio y uptime | `200` |
| `GET` | `/api/incidentes` | Lista incidentes (admite `?estado=`, `?severidad=`, `?search=`) | `200` |
| `GET` | `/api/incidentes/estadisticas` | Retorna métricas cuantitativas para el Dashboard | `200` |
| `GET` | `/api/incidentes/:id` | Retorna el detalle de un incidente específico por ID | `200`, `404` |
| `POST` | `/api/incidentes` | Crea un nuevo incidente validando campos requeridos | `201`, `400` |
| `PUT` | `/api/incidentes/:id` | Actualiza los datos de un incidente existente | `200`, `400`, `404` |
| `DELETE` | `/api/incidentes/:id` | Elimina un incidente del modelo en memoria | `200`, `404` |

---

## 📦 Empaquetado para Entrega
Para generar el archivo comprimido `.zip` requerido en la plataforma virtual, ejecute:
```bash
node package-submission.js
```
Esto creará el archivo **`T1S4_Gestion_Incidentes_Fer_Bermello.zip`** listo para subir.
