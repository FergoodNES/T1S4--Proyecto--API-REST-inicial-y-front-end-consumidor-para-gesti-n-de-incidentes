# JUSTIFICACIÓN TÉCNICA: ARQUITECTURA DE API REST Y FRONT-END CONSUMIDOR PARA GESTIÓN DE INCIDENTES

**Asignatura:** Redes de Plataforma  
**Actividad:** T1S4 — Proyecto API REST inicial y front-end consumidor  
**Estudiante:** Fernando Bermello  
**Fecha:** Septiembre 2026  
**Repositorio GitHub:** [https://github.com/FergoodNES/T1S4--Proyecto--API-REST-inicial-y-front-end-consumidor-para-gesti-n-de-incidentes](https://github.com/FergoodNES/T1S4--Proyecto--API-REST-inicial-y-front-end-consumidor-para-gesti-n-de-incidentes)  
**Despliegue en Producción (Render):** [https://t1s4-proyecto-api-rest-inicial-y-front.onrender.com/](https://t1s4-proyecto-api-rest-inicial-y-front.onrender.com/)  

---

## 1. Introducción y Contexto de Plataforma
En la administración de plataformas de telecomunicaciones y redes telemáticas modernas, la gestión ágil, centralizada y automatizada de incidencias operativas es un pilar crítico para garantizar la alta disponibilidad y cumplir con los acuerdos de nivel de servicio (SLA). El presente proyecto implementa una solución integral desacoplada compuesta por un servicio backend sustentado en una API RESTful desarrollada con Node.js y Express, complementada por una aplicación cliente web interactiva construida bajo el estándar HTML5, CSS3 y JavaScript moderno que consume los servicios mediante Fetch API.

## 2. Justificación Arquitectónica del Backend con Node.js y Express
La elección de Node.js se fundamenta en su modelo de ejecución asíncrono no bloqueante basado en un ciclo de eventos (Event Loop) impulsado por el motor V8. Para entornos de monitoreo de red donde convergen múltiples solicitudes concurrentes de diagnóstico, telemetría y actualización de estados, el patrón reactivo de Node.js proporciona un rendimiento superior con un bajo consumo de memoria y CPU frente a esquemas multihilo tradicionales.

Sobre este entorno, el framework Express provee una infraestructura minimalista y flexible que agiliza la implementación de servicios web mediante un sistema modular de enrutamiento y cadenas de middlewares. La estructura del servidor se diseñó bajo una separación estricta de responsabilidades (SoC):
1. **Configuración (`src/config/config.js`):** Gestiona variables de entorno y parámetros de ejecución.
2. **Modelo en memoria (`src/models/incidentModel.js`):** Abstrae la persistencia en memoria volátil (`in-memory data store`), encapsulando operaciones de filtrado multinivel por severidad, estado, categoría y texto libre, además de generar identificadores únicos y métricas estadísticas en tiempo de ejecución.
3. **Controladores (`src/controllers/incidentController.js`):** Gestionan el flujo de las peticiones, aplican validaciones semánticas y sintácticas sobre la carga útil (`payload`), y despachan respuestas HTTP con sus respectivos códigos de estado (200, 201, 400, 404).
4. **Enrutadores (`src/routes/incidentRoutes.js`):** Exponen los puntos de conexión bajo convenciones REST semánticas mediante verbos HTTP (GET, POST, PUT, DELETE).

## 3. Middlewares de Registro y Manejo Centralizado de Errores
El pipeline de procesamiento HTTP incorpora middlewares especializados que garantizan observabilidad y resiliencia:
- **Middleware de Registro (`loggerMiddleware`):** Diseñado específicamente para auditoría de tráfico en tiempo real. Intercepta el evento de culminación de la respuesta HTTP (`res.on('finish')`), registrando con precisión la marca de tiempo ISO, el verbo HTTP, el código de estado, la URL de destino, la dirección IP del cliente y la latencia calculada en milisegundos. Esta bitácora en consola resulta fundamental para el diagnóstico técnico en centros de operaciones de red (NOC).
- **Manejo Centralizado de Errores (`errorHandler` y `notFoundHandler`):** Se implementó un middleware terminal cuádruple `(err, req, res, next)` que atrapa excepciones síncronas y asíncronas no controladas, previniendo la caída del proceso (`server crash`) y respondiendo con un objeto JSON uniforme con código de estado 500. Asimismo, las rutas no registradas son interceptadas emitiendo un código 404 estandarizado.

## 4. Diseño del Front-End Consumidor e Integración con Fetch API
El cliente web fue concebido como un panel de control operacional (Dashboard NOC) enfocado en la usabilidad y la retroalimentación inmediata:
- **Consumo Asíncrono con Fetch:** Toda interacción con el servidor se realiza sin recargas de página (`Single-Page Application approach`). Las funciones de consulta (`GET`), creación (`POST`), modificación total/parcial (`PUT`) y eliminación (`DELETE`) utilizan promesas asíncronas (`async/await`) con encabezados `Content-Type: application/json`.
- **Manejo de Estado Local:** La aplicación mantiene sincronizado el estado de la lista de incidentes y los indicadores clave de desempeño (KPIs) en memoria cliente, renderizando reactivamente la vista y actualizando selectores de cambio rápido de estado.
- **Inspector de Tráfico en Tiempo Real:** El panel incluye una consola visual integrada que registra cada transacción Fetch ejecutada por el navegador, detallando el método, la ruta relativa, el código de respuesta obtenido y el tiempo de respuesta, proporcionando evidencia palpable de la comunicación cliente-servidor.

## 5. Conclusiones
La integración desacoplada entre una API RESTful construida con Express y una interfaz reactiva sustentada en Fetch API demuestra las ventajas de la arquitectura web moderna orientada a servicios. Se logra una solución ligera, mantenible y escalable, capaz de satisfacer los requisitos de registro, clasificación y resolución de fallas en plataformas telemáticas con una experiencia de usuario fluida y transparente.
