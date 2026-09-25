/**
 * NetOps IncidentHub - Front-end Consumidor de la API REST (T1S4)
 * Manejo de estado, consumo asíncrono con Fetch API, renderizado dinámico y panel de auditoría.
 */

// Estado global de la aplicación cliente
const state = {
  incidentes: [],
  filtros: {
    estado: 'Todos',
    severidad: 'Todas',
    categoria: 'Todas',
    search: ''
  },
  estadisticas: {
    total: 0,
    abiertos: 0,
    enProgreso: 0,
    resueltos: 0,
    criticos: 0
  },
  incidenteSeleccionado: null,
  cargando: false
};

// Configuración de endpoints de la API
const API_BASE_URL = window.location.origin;
const ENDPOINTS = {
  estado: `${API_BASE_URL}/api/estado`,
  incidentes: `${API_BASE_URL}/api/incidentes`,
  estadisticas: `${API_BASE_URL}/api/incidentes/estadisticas`
};

// Referencias a elementos del DOM
const DOM = {
  // Estado API
  apiStatusPill: document.getElementById('apiStatusPill'),
  apiStatusText: document.getElementById('apiStatusText'),
  apiLatencyBadge: document.getElementById('apiLatencyBadge'),
  consoleServerUrl: document.getElementById('consoleServerUrl'),
  
  // KPIs
  kpiTotal: document.getElementById('kpiTotal'),
  kpiAbiertos: document.getElementById('kpiAbiertos'),
  kpiEnProgreso: document.getElementById('kpiEnProgreso'),
  kpiResueltos: document.getElementById('kpiResueltos'),
  kpiCriticos: document.getElementById('kpiCriticos'),

  // Filtros
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  filterEstado: document.getElementById('filterEstado'),
  filterSeveridad: document.getElementById('filterSeveridad'),
  filterCategoria: document.getElementById('filterCategoria'),
  btnResetFilters: document.getElementById('btnResetFilters'),
  btnRefresh: document.getElementById('btnRefresh'),

  // Lista
  incidentsGrid: document.getElementById('incidentsGrid'),
  emptyState: document.getElementById('emptyState'),
  btnEmptyReset: document.getElementById('btnEmptyReset'),
  shownCount: document.getElementById('shownCount'),
  totalCount: document.getElementById('totalCount'),

  // Consola Fetch
  consoleBody: document.getElementById('consoleBody'),
  btnClearLogs: document.getElementById('btnClearLogs'),

  // Modal Crear / Editar
  incidentModal: document.getElementById('incidentModal'),
  modalTitle: document.getElementById('modalTitle'),
  incidentForm: document.getElementById('incidentForm'),
  incidentId: document.getElementById('incidentId'),
  formTitulo: document.getElementById('formTitulo'),
  formCategoria: document.getElementById('formCategoria'),
  formSeveridad: document.getElementById('formSeveridad'),
  formEstado: document.getElementById('formEstado'),
  formAsignado: document.getElementById('formAsignado'),
  formDescripcion: document.getElementById('formDescripcion'),
  errorTitulo: document.getElementById('errorTitulo'),
  errorDescripcion: document.getElementById('errorDescripcion'),
  btnSaveIncident: document.getElementById('btnSaveIncident'),
  btnSaveText: document.getElementById('btnSaveText'),
  btnSpinner: document.getElementById('btnSpinner'),
  btnOpenCreateModal: document.getElementById('btnOpenCreateModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelModal: document.getElementById('btnCancelModal'),

  // Modal Detalle
  detailModal: document.getElementById('detailModal'),
  detailBadges: document.getElementById('detailBadges'),
  detailTitle: document.getElementById('detailTitle'),
  detailSubtitle: document.getElementById('detailSubtitle'),
  detailDescription: document.getElementById('detailDescription'),
  detailId: document.getElementById('detailId'),
  detailAssignee: document.getElementById('detailAssignee'),
  detailCreatedAt: document.getElementById('detailCreatedAt'),
  detailUpdatedAt: document.getElementById('detailUpdatedAt'),
  detailRawJson: document.getElementById('detailRawJson'),
  btnCopyJson: document.getElementById('btnCopyJson'),
  btnEditFromDetail: document.getElementById('btnEditFromDetail'),
  btnCloseDetailModal: document.getElementById('btnCloseDetailModal'),
  btnCloseDetailBtn: document.getElementById('btnCloseDetailBtn'),

  // Toasts
  toastContainer: document.getElementById('toastContainer')
};

// ============================================================================
// Funciones de Consumo de API (Fetch Wrapper con Auditoría y Medición de Tiempo)
// ============================================================================

/**
 * Cliente HTTP personalizado basado en Fetch API que registra actividad en la consola gráfica.
 */
async function apiFetch(endpoint, options = {}) {
  const startTime = performance.now();
  const method = options.method || 'GET';

  try {
    const defaultHeaders = {
      'Accept': 'application/json'
    };

    if (options.body && typeof options.body === 'string') {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    const response = await fetch(endpoint, config);
    const duration = Math.round(performance.now() - startTime);
    const data = await response.json();

    // Registrar en consola de actividad visual
    logConsoleTraffic(method, endpoint, response.status, duration, data);

    if (!response.ok) {
      const error = new Error(data.message || data.error || `HTTP error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return { ok: true, status: response.status, data, duration };
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logConsoleTraffic(method, endpoint, error.status || 0, duration, null, error.message);
    throw error;
  }
}

/**
 * Agrega una entrada formateada a la consola de tráfico Fetch del front-end.
 */
function logConsoleTraffic(method, url, status, duration, data, errorMessage = null) {
  if (!DOM.consoleBody) return;

  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const relativeUrl = url.replace(API_BASE_URL, '') || '/';

  const entry = document.createElement('div');
  const methodClass = method.toLowerCase();
  entry.className = `console-entry ${errorMessage ? 'error' : methodClass}`;

  const statusText = status ? `[${status}]` : '[ERR]';
  const messageSnippet = errorMessage 
    ? `Error: ${errorMessage}` 
    : (data && data.message ? data.message : `Completado (${duration}ms)`);

  entry.innerHTML = `
    <span class="entry-time">[${timeStr}]</span>
    <span class="entry-tag">${method}</span>
    <span>${relativeUrl}</span>
    <span style="color: ${status >= 400 || !status ? '#ef4444' : '#10b981'}; font-weight: 700;">${statusText}</span>
    <span style="color: #94a3b8; font-size: 0.7rem;">${messageSnippet}</span>
  `;

  DOM.consoleBody.appendChild(entry);
  DOM.consoleBody.scrollTop = DOM.consoleBody.scrollHeight;
}

// ============================================================================
// Servicios de Comunicación con Backend
// ============================================================================

/**
 * Comprueba conectividad y latencia con el endpoint /api/estado
 */
async function verificarEstadoBackend() {
  const dot = DOM.apiStatusPill.querySelector('.status-dot');
  try {
    const result = await apiFetch(ENDPOINTS.estado);
    dot.className = 'status-dot online pulsing';
    DOM.apiStatusText.textContent = 'En Línea';
    DOM.apiLatencyBadge.textContent = `${result.duration} ms`;
    DOM.consoleServerUrl.textContent = API_BASE_URL;
  } catch (error) {
    dot.className = 'status-dot offline';
    DOM.apiStatusText.textContent = 'Desconectado';
    DOM.apiLatencyBadge.textContent = 'Fallo';
    showToast('error', 'Error de Conexión', 'No se pudo contactar con el backend Express.');
  }
}

/**
 * Obtiene métricas del sistema (/api/incidentes/estadisticas)
 */
async function cargarEstadisticas() {
  try {
    const result = await apiFetch(ENDPOINTS.estadisticas);
    if (result.data && result.data.data) {
      state.estadisticas = result.data.data;
      renderKPIs();
    }
  } catch (error) {
    console.warn('No se pudieron actualizar estadísticas:', error);
  }
}

/**
 * Carga incidentes con soporte para filtros
 */
async function cargarIncidentes() {
  state.cargando = true;
  renderLoadingState();

  try {
    // Construir parámetros de consulta para el backend
    const params = new URLSearchParams();
    if (state.filtros.estado !== 'Todos') params.append('estado', state.filtros.estado);
    if (state.filtros.severidad !== 'Todas') params.append('severidad', state.filtros.severidad);
    if (state.filtros.categoria !== 'Todas') params.append('categoria', state.filtros.categoria);
    if (state.filtros.search.trim()) params.append('search', state.filtros.search.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const result = await apiFetch(`${ENDPOINTS.incidentes}${queryString}`);

    state.incidentes = result.data.data || [];
    renderIncidentes();
    cargarEstadisticas();
  } catch (error) {
    DOM.incidentsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Error al consultar la API REST</h3>
        <p>${error.message || 'No se pudo obtener la lista de incidentes desde el servidor.'}</p>
        <button class="btn btn-primary" onclick="cargarIncidentes()">Reintentar conexión</button>
      </div>
    `;
  } finally {
    state.cargando = false;
  }
}

/**
 * Crear un nuevo incidente vía POST
 */
async function guardarNuevoIncidente(datos) {
  setFormLoading(true);
  try {
    const result = await apiFetch(ENDPOINTS.incidentes, {
      method: 'POST',
      body: JSON.stringify(datos)
    });

    showToast('success', 'Incidente Registrado', `ID #${result.data.data.id} creado con éxito.`);
    cerrarModalIncidente();
    cargarIncidentes();
  } catch (error) {
    const msg = error.data && error.data.messages ? error.data.messages.join(' ') : error.message;
    showToast('error', 'Error al Guardar', msg);
  } finally {
    setFormLoading(false);
  }
}

/**
 * Actualizar incidente existente vía PUT
 */
async function actualizarIncidente(id, datos) {
  setFormLoading(true);
  try {
    const result = await apiFetch(`${ENDPOINTS.incidentes}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });

    showToast('success', 'Incidente Actualizado', `Incidente #${id} modificado correctamente.`);
    cerrarModalIncidente();
    cargarIncidentes();
  } catch (error) {
    const msg = error.data && error.data.message ? error.data.message : error.message;
    showToast('error', 'Error al Actualizar', msg);
  } finally {
    setFormLoading(false);
  }
}

/**
 * Actualización rápida de estado desde la tarjeta vía PUT
 */
async function cambiarEstadoRapido(id, nuevoEstado) {
  try {
    await apiFetch(`${ENDPOINTS.incidentes}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });

    showToast('info', 'Estado Actualizado', `Incidente #${id} ahora está: ${nuevoEstado}`);
    cargarIncidentes();
  } catch (error) {
    showToast('error', 'Error', 'No se pudo cambiar el estado del incidente.');
    cargarIncidentes(); // Restaurar selector en caso de error
  }
}

/**
 * Eliminar incidente vía DELETE
 */
async function eliminarIncidente(id) {
  const confirmacion = confirm(`¿Está seguro de que desea eliminar el incidente #${id}? Esta acción no se puede deshacer.`);
  if (!confirmacion) return;

  try {
    await apiFetch(`${ENDPOINTS.incidentes}/${id}`, {
      method: 'DELETE'
    });

    showToast('info', 'Incidente Eliminado', `Incidente #${id} removido del sistema.`);
    cargarIncidentes();
  } catch (error) {
    showToast('error', 'Error al Eliminar', error.message);
  }
}

/**
 * Consultar detalle de un incidente vía GET /api/incidentes/:id
 */
async function verDetalleIncidente(id) {
  try {
    const result = await apiFetch(`${ENDPOINTS.incidentes}/${id}`);
    const incidente = result.data.data;
    state.incidenteSeleccionado = incidente;
    abrirModalDetalle(incidente);
  } catch (error) {
    showToast('error', 'Error al Obtener Detalle', error.message);
  }
}

// ============================================================================
// Renderizado dinámico y Gestión de la Interfaz
// ============================================================================

function renderKPIs() {
  DOM.kpiTotal.textContent = state.estadisticas.total ?? 0;
  DOM.kpiAbiertos.textContent = state.estadisticas.abiertos ?? 0;
  DOM.kpiEnProgreso.textContent = state.estadisticas.enProgreso ?? 0;
  DOM.kpiResueltos.textContent = state.estadisticas.resueltos ?? 0;
  DOM.kpiCriticos.textContent = state.estadisticas.criticos ?? 0;
}

function renderLoadingState() {
  DOM.emptyState.style.display = 'none';
  DOM.incidentsGrid.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Consultando base de incidentes vía API REST...</p>
    </div>
  `;
}

function renderIncidentes() {
  DOM.shownCount.textContent = state.incidentes.length;
  DOM.totalCount.textContent = state.estadisticas.total || state.incidentes.length;

  if (state.incidentes.length === 0) {
    DOM.incidentsGrid.innerHTML = '';
    DOM.emptyState.style.display = 'block';
    return;
  }

  DOM.emptyState.style.display = 'none';
  DOM.incidentsGrid.innerHTML = state.incidentes.map(inc => {
    const sevClass = `sev-${inc.severidad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
    const badgeSevClass = `badge-${inc.severidad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
    const badgeEstClass = `badge-${inc.estado.toLowerCase().replace(' ', '-')}`;
    
    // Formateo de fecha legible
    const fechaObj = new Date(inc.fechaReporte);
    const fechaFormateada = isNaN(fechaObj) ? inc.fechaReporte : fechaObj.toLocaleString('es-EC', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <article class="incident-card ${sevClass}" data-id="${inc.id}">
        <div class="card-top-row">
          <div class="card-meta-left">
            <span class="id-badge">#INC-${inc.id.toString().padStart(4, '0')}</span>
            <span class="badge ${badgeSevClass}">${inc.severidad}</span>
            <span class="badge badge-categoria">${inc.categoria}</span>
            <span class="badge ${badgeEstClass}">${inc.estado}</span>
          </div>

          <div class="quick-status">
            <select class="quick-status-select" onchange="cambiarEstadoRapido(${inc.id}, this.value)" title="Cambio rápido de estado">
              <option value="Abierto" ${inc.estado === 'Abierto' ? 'selected' : ''}>Abierto</option>
              <option value="En Progreso" ${inc.estado === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
              <option value="Resuelto" ${inc.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
              <option value="Cerrado" ${inc.estado === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
            </select>
          </div>
        </div>

        <h3 class="card-title">${escapeHtml(inc.titulo)}</h3>
        <p class="card-description">${escapeHtml(inc.descripcion)}</p>

        <div class="card-footer">
          <div class="card-info-group">
            <span class="info-item" title="Responsable">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              ${escapeHtml(inc.asignadoA || 'Sin Asignar')}
            </span>
            <span class="info-item" title="Fecha de detección">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${fechaFormateada}
            </span>
          </div>

          <div class="card-actions">
            <button class="btn-card-action" onclick="verDetalleIncidente(${inc.id})" title="Ver detalle completo y JSON de API">Detalle</button>
            <button class="btn-card-action" onclick="abrirModalEditar(${inc.id})" title="Editar campos">Editar</button>
            <button class="btn-card-action action-delete" onclick="eliminarIncidente(${inc.id})" title="Eliminar de memoria">Eliminar</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================================================
// Modales y Formularios
// ============================================================================

function abrirModalCrear() {
  DOM.incidentForm.reset();
  DOM.incidentId.value = '';
  DOM.modalTitle.textContent = 'Nuevo Incidente de Plataforma';
  DOM.btnSaveText.textContent = 'Registrar Incidente';
  limpiarErroresFormulario();
  DOM.incidentModal.classList.add('active');
  DOM.formTitulo.focus();
}

function abrirModalEditar(id) {
  const inc = state.incidentes.find(i => i.id === id);
  if (!inc) return;

  DOM.incidentId.value = inc.id;
  DOM.formTitulo.value = inc.titulo;
  DOM.formCategoria.value = inc.categoria;
  DOM.formSeveridad.value = inc.severidad;
  DOM.formEstado.value = inc.estado;
  DOM.formAsignado.value = inc.asignadoA || '';
  DOM.formDescripcion.value = inc.descripcion;

  DOM.modalTitle.textContent = `Editar Incidente #INC-${inc.id.toString().padStart(4, '0')}`;
  DOM.btnSaveText.textContent = 'Guardar Cambios';
  limpiarErroresFormulario();
  DOM.incidentModal.classList.add('active');
  DOM.formTitulo.focus();
}

function cerrarModalIncidente() {
  DOM.incidentModal.classList.remove('active');
  limpiarErroresFormulario();
}

function abrirModalDetalle(inc) {
  const badgeSevClass = `badge-${inc.severidad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
  const badgeEstClass = `badge-${inc.estado.toLowerCase().replace(' ', '-')}`;

  DOM.detailBadges.innerHTML = `
    <span class="id-badge">#INC-${inc.id.toString().padStart(4, '0')}</span>
    <span class="badge ${badgeSevClass}">${inc.severidad}</span>
    <span class="badge badge-categoria">${inc.categoria}</span>
    <span class="badge ${badgeEstClass}">${inc.estado}</span>
  `;

  DOM.detailTitle.textContent = inc.titulo;
  DOM.detailSubtitle.textContent = `Categoría: ${inc.categoria} | Estado actual: ${inc.estado}`;
  DOM.detailDescription.textContent = inc.descripcion;
  DOM.detailId.textContent = `#INC-${inc.id.toString().padStart(4, '0')}`;
  DOM.detailAssignee.textContent = inc.asignadoA || 'Sin Asignar';
  DOM.detailCreatedAt.textContent = new Date(inc.fechaReporte).toLocaleString('es-EC');
  DOM.detailUpdatedAt.textContent = new Date(inc.fechaActualizacion).toLocaleString('es-EC');
  DOM.detailRawJson.textContent = JSON.stringify(inc, null, 2);

  DOM.detailModal.classList.add('active');
}

function cerrarModalDetalle() {
  DOM.detailModal.classList.remove('active');
}

function limpiarErroresFormulario() {
  DOM.errorTitulo.textContent = '';
  DOM.errorDescripcion.textContent = '';
}

function setFormLoading(isLoading) {
  DOM.btnSaveIncident.disabled = isLoading;
  DOM.btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
  DOM.btnSaveText.style.opacity = isLoading ? '0.7' : '1';
}

// ============================================================================
// Notificaciones Toast y Utilidades
// ============================================================================

function showToast(tipo, titulo, mensaje) {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconMap[tipo] || '🔔'}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(titulo)}</div>
      <div class="toast-msg">${escapeHtml(mensaje)}</div>
    </div>
  `;

  DOM.toastContainer.appendChild(toast);

  // Animar entrada
  requestAnimationFrame(() => toast.classList.add('show'));

  // Desvanecer y remover tras 4 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// Event Listeners y Enlaces de Controles
// ============================================================================

function setupEventListeners() {
  // Búsqueda en tiempo real con debounce
  let searchTimeout = null;
  DOM.searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    DOM.btnClearSearch.style.display = val ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filtros.search = val;
      cargarIncidentes();
    }, 250);
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.btnClearSearch.style.display = 'none';
    state.filtros.search = '';
    cargarIncidentes();
    DOM.searchInput.focus();
  });

  // Filtros desplegables
  DOM.filterEstado.addEventListener('change', (e) => {
    state.filtros.estado = e.target.value;
    cargarIncidentes();
  });

  DOM.filterSeveridad.addEventListener('change', (e) => {
    state.filtros.severidad = e.target.value;
    cargarIncidentes();
  });

  DOM.filterCategoria.addEventListener('change', (e) => {
    state.filtros.categoria = e.target.value;
    cargarIncidentes();
  });

  // Botón Limpiar Filtros
  const resetFiltersFn = () => {
    DOM.searchInput.value = '';
    DOM.btnClearSearch.style.display = 'none';
    DOM.filterEstado.value = 'Todos';
    DOM.filterSeveridad.value = 'Todas';
    DOM.filterCategoria.value = 'Todas';

    state.filtros = {
      estado: 'Todos',
      severidad: 'Todas',
      categoria: 'Todas',
      search: ''
    };
    cargarIncidentes();
  };

  DOM.btnResetFilters.addEventListener('click', resetFiltersFn);
  DOM.btnEmptyReset.addEventListener('click', resetFiltersFn);

  // Botón Sincronizar / Refrescar
  DOM.btnRefresh.addEventListener('click', () => {
    verificarEstadoBackend();
    cargarIncidentes();
    showToast('info', 'Sincronizado', 'Datos actualizados con el servidor.');
  });

  // Limpiar consola Fetch
  DOM.btnClearLogs.addEventListener('click', () => {
    DOM.consoleBody.innerHTML = `
      <div class="console-entry info">
        <span class="entry-time">[${new Date().toTimeString().split(' ')[0]}]</span>
        <span class="entry-tag">SISTEMA</span>
        <span class="entry-msg">Registro de tráfico limpio y preparado.</span>
      </div>
    `;
  });

  // Abrir y cerrar modal de creación/edición
  DOM.btnOpenCreateModal.addEventListener('click', abrirModalCrear);
  DOM.btnCloseModal.addEventListener('click', cerrarModalIncidente);
  DOM.btnCancelModal.addEventListener('click', cerrarModalIncidente);

  // Enviar formulario (Crear o Actualizar)
  DOM.incidentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    limpiarErroresFormulario();

    const titulo = DOM.formTitulo.value.trim();
    const descripcion = DOM.formDescripcion.value.trim();
    const categoria = DOM.formCategoria.value;
    const severidad = DOM.formSeveridad.value;
    const estado = DOM.formEstado.value;
    const asignadoA = DOM.formAsignado.value.trim() || 'Sin Asignar';
    const id = DOM.incidentId.value;

    let hasErrors = false;
    if (titulo.length < 5) {
      DOM.errorTitulo.textContent = 'El título debe tener al menos 5 caracteres.';
      hasErrors = true;
    }
    if (descripcion.length < 10) {
      DOM.errorDescripcion.textContent = 'La descripción debe tener al menos 10 caracteres.';
      hasErrors = true;
    }

    if (hasErrors) return;

    const payload = {
      titulo,
      descripcion,
      categoria,
      severidad,
      estado,
      asignadoA
    };

    if (id) {
      actualizarIncidente(id, payload);
    } else {
      guardarNuevoIncidente(payload);
    }
  });

  // Modal Detalle
  DOM.btnCloseDetailModal.addEventListener('click', cerrarModalDetalle);
  DOM.btnCloseDetailBtn.addEventListener('click', cerrarModalDetalle);

  DOM.btnEditFromDetail.addEventListener('click', () => {
    if (state.incidenteSeleccionado) {
      cerrarModalDetalle();
      abrirModalEditar(state.incidenteSeleccionado.id);
    }
  });

  DOM.btnCopyJson.addEventListener('click', () => {
    navigator.clipboard.writeText(DOM.detailRawJson.textContent).then(() => {
      DOM.btnCopyJson.textContent = '¡Copiado!';
      setTimeout(() => DOM.btnCopyJson.textContent = 'Copiar JSON', 2000);
    });
  });

  // Cerrar modales con tecla Escape y clic en backdrop
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarModalIncidente();
      cerrarModalDetalle();
    }
  });

  [DOM.incidentModal, DOM.detailModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModalIncidente();
        cerrarModalDetalle();
      }
    });
  });
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  verificarEstadoBackend();
  cargarIncidentes();

  // Verificación periódica de estado cada 30 segundos
  setInterval(verificarEstadoBackend, 30000);
});

// Exponer funciones globales para llamadas inline en HTML
window.cambiarEstadoRapido = cambiarEstadoRapido;
window.eliminarIncidente = eliminarIncidente;
window.verDetalleIncidente = verDetalleIncidente;
window.abrirModalEditar = abrirModalEditar;
window.cargarIncidentes = cargarIncidentes;
