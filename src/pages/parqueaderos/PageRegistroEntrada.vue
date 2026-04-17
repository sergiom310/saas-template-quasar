<template>
  <q-page padding class="my-page">
    <q-card class="q-pa-lg q-mb-lg">
      <div class="q-mb-md">
        <div class="q-gutter-sm row no-wrap scroll-x">
          <template v-if="tiposVehiculo.length > 0">
            <q-chip
              v-for="tipo in tiposVehiculo"
              :key="tipo.id"
              clickable
              :color="tipoSeleccionado === tipo.id ? 'green' : 'grey-3'"
              :text-color="tipoSeleccionado === tipo.id ? 'white' : 'black'"
              @click="seleccionarTipo(tipo.id)"
              class="q-pa-lg q-mr-md chip-vehiculo"
              :class="{ 'shadow-2': tipoSeleccionado === tipo.id }"
              square
            >
              <q-avatar v-if="tipo.imagen">
                <q-icon :name="tipo.imagen" :color="tipoSeleccionado === tipo.id ? 'white' : 'primary'" size="32px" />
              </q-avatar>
              <span class="chip-label">{{ tipo.nombre }}</span>
            </q-chip>
          </template>
          <template v-else>
            <div class="text-grey q-pa-md">No hay tipos de vehículo activos</div>
          </template>
        </div>
      </div>
      <div class="q-mb-md">
       <q-input
        v-model="placa"
        label="Placa del vehículo"
        placeholder="ABC123"
        outlined
        autofocus
        hide-bottom-space
        class="q-input-placa-grande"
        input-class="input-placa-grande"
        input-style="font-size: 90px; font-weight: bold; text-align: center; "
        @keyup.enter="guardarRegistro"
        :rules="[val => !!val || 'Campo requerido']"
        maxlength="15"
      />
      </div>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Vehículos en el parqueadero</div>
        <!-- Filtros -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-3">
            <q-input v-model="filtroFechaEntrada" type="date" label="Fecha de entrada" filled dense clearable />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="filtroFechaSalida" type="date" label="Fecha de salida" filled dense clearable />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtroEstado"
              :options="['ABIERTA', 'CERRADA']"
              label="Estado"
              filled
              dense
              clearable
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtroTipoVehiculo"
              :options="tiposVehiculo"
              label="Tipo de Vehículo"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              filled
              dense
              clearable
            />
          </div>
        </div>
        <div class="q-mb-sm">
          <span>
            Mostrando {{ facturasFiltradas.length }} de {{ facturas.length }} registros
            <span v-if="filtroFechaEntrada || filtroFechaSalida || filtroEstado || filtroTipoVehiculo"> (filtrado)</span>
          </span>
        </div>
        <q-table
          :rows="facturasFiltradas"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loadingFacturas"
          v-model:pagination="paginacionTabla"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="id" :props="props">{{ props.row.id }}</q-td>
              <q-td key="placa" :props="props">{{ props.row.placa }}</q-td>
              <q-td key="tipo_vehiculo" :props="props">{{ props.row.tipo_vehiculo?.nombre || props.row.tipo_vehiculo_id }}</q-td>
              <q-td key="fecha_entrada" :props="props">{{ formatFecha(props.row.fecha_entrada) }}</q-td>
              <q-td key="hora_entrada" :props="props">{{ formatHora(props.row.fecha_entrada) }}</q-td>
              <q-td key="fecha_salida" :props="props">{{ props.row.fecha_salida ? formatFecha(props.row.fecha_salida) : '-' }}</q-td>
              <q-td key="hora_salida" :props="props">{{ props.row.fecha_salida ? formatHora(props.row.fecha_salida) : '-' }}</q-td>
              <q-td key="minutos" :props="props">{{ calcularMinutos(props.row.fecha_entrada, props.row.fecha_salida) }}</q-td>
              <q-td key="valor_pagado" :props="props">{{ formatMoneda(props.row.valor_pagado) }}</q-td>
              <q-td key="metodo_pago" :props="props">{{ props.row.metodo_pago?.detalle || '-' }}</q-td>
              <q-td key="estado" :props="props">
                <div :style="{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  background: props.row.estado === 'ABIERTA' ? '#d4f8e8' : '#ffd6d6',
                  color: props.row.estado === 'ABIERTA' ? '#218838' : '#c82333',
                  fontWeight: 'bold',
                  minWidth: '70px',
                  textAlign: 'center'
                }">
                  {{ props.row.estado }}
                </div>
              </q-td>
              <q-td key="detalle" :props="props">
                <q-input
                  v-model="props.row.detalle"
                  dense
                  borderless
                  @keyup.enter="actualizarDetalle(props.row)"
                  @blur="actualizarDetalle(props.row)"
                  :placeholder="'Editar detalle'"
                  style="min-width:120px;"
                />
              </q-td>
              <q-td key="imprimir" :props="props">
                <q-btn icon="print" color="primary" flat @click="imprimirReciboSalida(props.row)" :disable="props.row.estado !== 'CERRADA'" />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal de cobro pendiente -->
    <q-dialog v-model="mostrarModalCobro" persistent>
      <q-card style="min-width: 400px; max-width: 95vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Cobro pendiente</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="mostrarModalCobro = false" />
        </q-card-section>
        <q-card-section>
          <div v-if="facturaCobro">
            <div><b>Tipo de vehículo:</b> {{ facturaCobro.tipo_vehiculo?.nombre || facturaCobro.tipo_vehiculo_id }}</div>
            <div><b>Placa:</b> {{ facturaCobro.placa }}</div>
            <div><b>Hora de entrada:</b> {{ formatFechaHora(facturaCobro.fecha_entrada) }}</div>
            <div><b>Hora de salida:</b> {{ formatFechaHora(new Date()) }}</div>
            <div><b>Tiempo transcurrido:</b> {{ calcularTiempoTranscurrido(facturaCobro.fecha_entrada) }}</div>
            <div class="q-mt-md valor-cobro-wrapper">
              <div class="valor-cobro-display">{{ formatMoneda(valorCobro) }}</div>
              <div class="q-mt-sm">
                <q-input
                  v-model.number="valorCobro"
                  label="Editar valor"
                  type="number"
                  min="0"
                  class="valor-cobro-input"
                  dense
                  hide-bottom-space
                  @keyup.enter="confirmarCobro"
                />
              </div>
            </div>
            <div class="q-mt-md">
              <q-select
                v-model="metodoPagoId"
                :options="metodosPagosStore.metodosPagos"
                label="Método de pago"
                option-value="id"
                option-label="detalle"
                emit-value
                map-options
                :options-dense="true"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup @click="mostrarModalCobro = false" />
          <q-btn flat label="Confirmar cobro" color="primary" @click="confirmarCobro" :disable="!valorCobro || !metodoPagoId" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Ticket de entrada -->
    <TicketEntrada v-if="mostrarTicket" :factura-id="facturaIdTicket" v-model="mostrarTicket" :mensaje-recibo="mensajeReciboEmpresa" />

    <!-- Totales del día -->
    <div class="q-mt-xl">
      <q-card class="q-pa-md">
        <div class="text-h6">Totales del día <span style="font-weight:normal; font-size:1rem;">({{ fechaFiltradaTotales }})</span></div>
        <div class="row q-mt-sm">
          <div class="col-6"><b>Total cobrado:</b> {{ formatMoneda(totalesDia.total) }}</div>
          <div class="col-6"><b>Vehículos cobrados:</b> {{ totalesDia.cantidad }}</div>
        </div>
        <div class="q-mt-md">
          <div class="text-h6">Cobrado por método de pago:</div>
          <div v-for="(valor, metodo) in totalesDia.sumasPorMetodo" :key="metodo" class="q-mt-xs">
            <b>{{ metodo }}:</b> {{ formatMoneda(valor) }}
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { Loading } from 'quasar'
import { useMetodosPagosStore } from 'src/stores/metodosPagos'
import { useTarifasStore } from 'src/stores/tarifas'
import TicketEntrada from './TicketEntrada.vue'

// --- FUNCIÓN PARA ACTUALIZAR DETALLE ---
async function actualizarDetalle(row) {
  try {
    await api.put(`/api/facturas/${row.id}`, {
      id: row.id,
      tarifa_id: row.tarifa_id,
      tipo_vehiculo_id: row.tipo_vehiculo_id,
      placa: row.placa,
      fecha_entrada: row.fecha_entrada,
      fecha_salida: row.fecha_salida,
      valor_pagado: row.valor_pagado,
      valor_calculado: row.valor_calculado,
      metodo_pago_id: row.metodo_pago_id,
      estado: row.estado,
      detalle: row.detalle,
      cliente_id: row.cliente_id,
      usuario_id: row.usuario_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    })
    $q.notify({ type: 'positive', message: 'Detalle actualizado' })
  } catch (e) {
    let msg = e?.response?.data?.message || e?.response?.data?.errors?.detalle?.[0] || e?.message || 'Error actualizando detalle'
    $q.notify({ type: 'negative', message: msg })
  }
}


// Mensaje de recibo de empresa
const mensajeReciboEmpresa = ref('');

// Cargar mensaje de empresa al iniciar
async function cargarMensajeEmpresa() {
  try {
    const res = await api.get('/api/empresa');
    if (res.data) {
      mensajeReciboEmpresa.value = res.data;
    } else {
      mensajeReciboEmpresa.value = { mensaje_recibo: '¡Gracias por su visita!' };
    }
  } catch {
    mensajeReciboEmpresa.value = { mensaje_recibo: '¡Gracias por su visita!' };
  }
}

// --- FUNCIÓN PARA IMPRIMIR RECIBO DE SALIDA ---
function imprimirReciboSalida(row) {
  if (!row) return;
  // Solo permitir imprimir si la factura está cerrada
  if (row.estado !== 'CERRADA') {
    $q.notify({ type: 'warning', message: 'Solo se puede imprimir el recibo de salida para facturas cerradas.' })
    return;
  }
  // Construir HTML del recibo con logo y setTimeout
  const tiempoTranscurrido = calcularTiempoTranscurrido(row.fecha_entrada, row.fecha_salida);
  const empresa = (typeof mensajeReciboEmpresa.value === 'object' && mensajeReciboEmpresa.value !== null)
    ? mensajeReciboEmpresa.value
    : (window.empresaData || {});
  let nombre = empresa.nombre || '';
  let nit = empresa.nit || '';
  let direccion = empresa.direccion || '';
  let telefono = empresa.telefono || '';
  let horario = empresa.horario_atencion || '';
  let logo_path = empresa.logo_path || '';
  // Obtener configuración
  let config = window.configuracionEmpresa || { imp_logo: 'S', imp_nombre: 'S', imp_nit: 'S', imp_tel: 'S', imp_dir: 'S', imp_horario: 'S' };
  // Si no hay datos, intentar obtenerlos del backend (solo si están vacíos)
  if ((!nombre || !config) && !window.empresaData) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/empresa', false); // síncrono
      xhr.send(null);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        nombre = data.nombre || '';
        nit = data.nit || '';
        direccion = data.direccion || '';
        telefono = data.telefono || '';
        horario = data.horario_atencion || '';
        logo_path = data.logo_path || '';
        window.empresaData = data;
      }
    } catch { /* ignorar error de consulta de empresa */ }
  }
  // Obtener config de impresión
  if (!window.configuracionEmpresa) {
    try {
      var xhr2 = new XMLHttpRequest();
      xhr2.open('GET', '/api/configuracion', false);
      xhr2.send(null);
      if (xhr2.status === 200) {
        config = JSON.parse(xhr2.responseText);
        window.configuracionEmpresa = config;
      }
    } catch { /* ignore error */ }
  }
  // Construir encabezado con logo si corresponde
  let encabezado = `<div style='text-align:center; margin-bottom:8px; font-size:13px;'>`;
  if (config.imp_logo === 'S' && logo_path) {
    const { protocol, hostname } = window.location;
    const clean = logo_path.replace(/^\/*/, '');
    const logoUrl = `${protocol}//${hostname.replace(':9000', '')}:8000/storage/${clean}`;
    encabezado += `<img src='${logoUrl}' alt='Logo' style='max-width:80px; max-height:80px; margin-bottom:4px; display:block; margin-left:auto; margin-right:auto;' />`;
  }
  if (config.imp_nombre === 'S' && nombre) encabezado += `<div style='font-weight:bold; text-transform:uppercase;'>${nombre}</div>`;
  if (config.imp_nit === 'S' && nit) encabezado += `<div>NIT: ${nit}</div>`;
  if (config.imp_dir === 'S' && direccion) encabezado += `<div style='font-weight:bold;'>${direccion}</div>`;
  if (config.imp_tel === 'S' && telefono) encabezado += `<div style='font-weight:bold;'>Tel: ${telefono}</div>`;
  if (config.imp_horario === 'S' && horario) encabezado += `<div style='font-weight:bold;'>${horario}</div>`;
  encabezado += `</div>`;
  const mensajeRecibo = typeof mensajeReciboEmpresa.value === 'string' ? mensajeReciboEmpresa.value : (mensajeReciboEmpresa.value?.mensaje_recibo || '');
  const html = `
    <html>
      <head>
        <title>Recibo de Salida</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          .encabezado { text-align: center; margin-bottom: 12px; }
          .info { margin-bottom: 12px; }
          .label { font-weight: bold; }
          .valor { float: right; }
          .row { margin-bottom: 6px; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="encabezado">
          ${encabezado}
        </div>
        <h2>Recibo de Salida</h2>
        <div class="info">
          <div class="row"><span class="label">ID:</span> <span class="valor">${row.id}</span></div>
          <div class="row"><span class="label">Placa:</span> <span class="valor">${row.placa}</span></div>
          <div class="row"><span class="label">Tipo de vehículo:</span> <span class="valor">${row.tipo_vehiculo?.nombre || row.tipo_vehiculo_id}</span></div>
          <div class="row"><span class="label">Fecha entrada:</span> <span class="valor">${formatFecha(row.fecha_entrada)} ${formatHora(row.fecha_entrada)}</span></div>
          <div class="row"><span class="label">Fecha salida:</span> <span class="valor">${row.fecha_salida ? formatFecha(row.fecha_salida) : '-'} ${row.fecha_salida ? formatHora(row.fecha_salida) : '-'}</span></div>
          <div class="row"><span class="label">Tiempo transcurrido:</span> <span class="valor">${tiempoTranscurrido}</span></div>
          <div class="row"><span class="label">Valor pagado:</span> <span class="valor">${formatMoneda(row.valor_pagado)}</span></div>
          <div class="row"><span class="label">Método de pago:</span> <span class="valor">${row.metodo_pago?.detalle || '-'}</span></div>
          <div class="row"><span class="label">Detalle:</span> <span class="valor">${row.detalle || '-'}</span></div>
        </div>
        <div class="center" style="font-weight:bold;">${mensajeRecibo}</div>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  } else {
    $q.notify({ type: 'negative', message: 'No se pudo abrir la ventana de impresión.' })
  }
}

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
  { name: 'placa', label: 'Placa', align: 'left', field: 'placa', sortable: true },
  { name: 'tipo_vehiculo', label: 'Tipo de vehículo', align: 'left', field: row => row.tipo_vehiculo?.nombre || row.tipo_vehiculo_id, sortable: true },
  { name: 'fecha_entrada', label: 'Fecha entrada', align: 'left', field: row => formatFecha(row.fecha_entrada), sortable: true },
  { name: 'hora_entrada', label: 'Hora entrada', align: 'left', field: row => formatHora(row.fecha_entrada), sortable: false },
  { name: 'fecha_salida', label: 'Fecha salida', align: 'left', field: row => row.fecha_salida ? formatFecha(row.fecha_salida) : '-', sortable: true },
  { name: 'hora_salida', label: 'Hora salida', align: 'left', field: row => row.fecha_salida ? formatHora(row.fecha_salida) : '-', sortable: false },
  { name: 'minutos', label: 'Minutos', align: 'right', field: row => calcularMinutos(row.fecha_entrada, row.fecha_salida), sortable: false, classes: 'hidden', headerClasses: 'hidden' },
  { name: 'valor_pagado', label: 'Valor pagado', align: 'right', field: 'valor_pagado', sortable: true },
  { name: 'metodo_pago', label: 'Método de pago', align: 'left', field: row => row.metodo_pago?.detalle || '-', sortable: false },
  { name: 'estado', label: 'Estado', align: 'left', field: 'estado', sortable: true },
  { name: 'detalle', label: 'Detalle', align: 'left', field: 'detalle', sortable: false },
  { name: 'imprimir', label: '', align: 'center', field: 'id', sortable: false },
]

function formatFecha(fecha) {
  if (!fecha) return ''
  const d = typeof fecha === 'string' ? new Date(fecha.replace(' ', 'T')) : fecha
  if (isNaN(d)) return ''
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function formatHora(fecha) {
  if (!fecha) return ''
  const d = typeof fecha === 'string' ? new Date(fecha.replace(' ', 'T')) : fecha
  if (isNaN(d)) return ''
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function calcularMinutos(fechaEntrada, fechaSalida) {
  if (!fechaEntrada) return '-'
  const entrada = new Date(fechaEntrada)
  const salida = fechaSalida ? new Date(fechaSalida) : new Date()
  if (isNaN(entrada) || isNaN(salida)) return '-'
  const diff = Math.floor((salida - entrada) / 60000)
  return diff
}
const mostrarTicket = ref(false)
const facturaIdTicket = ref(null)

const $q = useQuasar()
const placa = ref('')
const tiposVehiculo = ref([])
const tipoSeleccionado = ref(null)
const facturas = ref([])
const loadingFacturas = ref(false)

// Filtros
const filtroFechaEntrada = ref(null)
const filtroFechaSalida = ref(null)
const filtroEstado = ref('')
const filtroTipoVehiculo = ref(null)

const facturasFiltradas = computed(() => {
  return facturas.value.filter(f => {
    let cumple = true;
    // Filtro estado
    if (filtroEstado.value && f.estado !== filtroEstado.value) cumple = false;

    // Filtro tipo de vehículo
    if (filtroTipoVehiculo.value && f.tipo_vehiculo_id !== filtroTipoVehiculo.value) cumple = false;

    // Filtro fecha entrada
    if (filtroFechaEntrada.value) {
      if (!f.fecha_entrada) {
        cumple = false;
      } else {
        let fechaEntrada = typeof f.fecha_entrada === 'string' ? f.fecha_entrada.split(' ')[0].trim() : '';
        // Normalizar el formato de la fecha
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaEntrada)) {
          const [d, m, y] = fechaEntrada.split('/');
          fechaEntrada = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (fechaEntrada !== filtroFechaEntrada.value) {
          const [filtroY, filtroM, filtroD] = filtroFechaEntrada.value.split('-').map(Number);
          let entradaY, entradaM, entradaD;
          if (/^\d{4}-\d{2}-\d{2}$/.test(fechaEntrada)) {
            [entradaY, entradaM, entradaD] = fechaEntrada.split('-').map(Number);
          } else {
            const dateEntrada = new Date(fechaEntrada);
            entradaY = dateEntrada.getFullYear();
            entradaM = dateEntrada.getMonth() + 1;
            entradaD = dateEntrada.getDate();
          }
          if (entradaY !== filtroY || entradaM !== filtroM || entradaD !== filtroD) {
            cumple = false;
          }
        }
      }
    }

    // Filtro fecha salida
    if (filtroFechaSalida.value) {
      if (!f.fecha_salida) {
        cumple = false;
      } else {
        let fechaSalida = typeof f.fecha_salida === 'string' ? f.fecha_salida.split(' ')[0].trim() : '';
        // Normalizar el formato de la fecha
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaSalida)) {
          const [d, m, y] = fechaSalida.split('/');
          fechaSalida = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (fechaSalida !== filtroFechaSalida.value) {
          const [filtroY, filtroM, filtroD] = filtroFechaSalida.value.split('-').map(Number);
          let salidaY, salidaM, salidaD;
          if (/^\d{4}-\d{2}-\d{2}$/.test(fechaSalida)) {
            [salidaY, salidaM, salidaD] = fechaSalida.split('-').map(Number);
          } else {
            const dateSalida = new Date(fechaSalida);
            salidaY = dateSalida.getFullYear();
            salidaM = dateSalida.getMonth() + 1;
            salidaD = dateSalida.getDate();
          }
          if (salidaY !== filtroY || salidaM !== filtroM || salidaD !== filtroD) {
            cumple = false;
          }
        }
      }
    }

    return cumple;
  });
});

// Paginación reactiva para que el paginador se actualice con los filtros
const paginacionTabla = ref({
  page: 1,
  rowsPerPage: 10
});

// Resetear página al aplicar filtros
watch([filtroFechaEntrada, filtroFechaSalida, filtroEstado, filtroTipoVehiculo], () => {
  paginacionTabla.value.page = 1;
});

// Modal de cobro
const mostrarModalCobro = ref(false)
const facturaCobro = ref(null)
const valorCobro = ref(0)
const valorManualActivo = ref(false)
const metodoPagoId = ref(null)
const metodosPagosStore = useMetodosPagosStore()
const tarifasStore = useTarifasStore()
const metodoPagoDefault = computed(() => {
  return metodosPagosStore.metodosPagos.find(m => m.detalle.toLowerCase() === 'efectivo')?.id || null
})

// Calcular valor de cobro usando el backend
async function calcularValorCobro() {
  valorManualActivo.value = false
  if (!facturaCobro.value || !facturaCobro.value.tarifa_id) {
    valorCobro.value = 0
    valorManualActivo.value = true
    $q.notify({ type: 'negative', message: 'La factura no tiene tarifa asignada. Debes digitar el valor manualmente.' })
    return
  }
  try {
    const now = new Date()
    const payload = {
      tarifa_id: facturaCobro.value.tarifa_id,
      tipo_vehiculo_id: facturaCobro.value.tipo_vehiculo_id,
      fecha_entrada: facturaCobro.value.fecha_entrada,
      fecha_salida: now.toISOString(),
    }
    const response = await api.post('/api/facturas/calcular-tarifa', payload)
    valorCobro.value = response.data.valor
  } catch (e) {
    valorCobro.value = 0
    valorManualActivo.value = true
    $q.notify({ type: 'negative', message: e?.response?.data?.error || e?.message || 'No se pudo calcular el valor. Debes digitar el valor manualmente.' })
  }
}

// Calcular tiempo transcurrido (formato HH:mm)
function calcularTiempoTranscurrido(fechaEntrada, fechaSalida) {
  if (!fechaEntrada) return '-';
  const entrada = new Date(fechaEntrada);
  const salida = fechaSalida ? new Date(fechaSalida) : new Date();
  let diff = Math.floor((salida - entrada) / 1000); // segundos
  const horas = Math.floor(diff / 3600);
  diff = diff % 3600;
  const minutos = Math.floor(diff / 60);
  return `${horas}h ${minutos}m`;
}

// Totales del día
const totalesDia = ref({ total: 0, cantidad: 0 })
const fechaFiltradaTotales = computed(() => {
  // Usar el día actual como ejemplo, puedes cambiarlo por el filtro real si lo implementas
  const hoy = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;
});
async function cargarTotalesDia() {
  // Sumar todas las facturas cerradas cuya fecha_salida sea del día actual
  const hoy = new Date();
  const esMismoDia = (fechaStr) => {
    if (!fechaStr) return false;
    const fecha = typeof fechaStr === 'string' ? new Date(fechaStr.replace(' ', 'T')) : fechaStr;
    return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  };
  const cerradas = facturas.value.filter(f => f.estado === 'CERRADA' && f.fecha_salida && esMismoDia(f.fecha_salida));
  // Sumatoria total y por método de pago
  const sumasPorMetodo = {};
  cerradas.forEach(f => {
    const metodo = f.metodo_pago?.detalle || 'Sin método';
    if (!sumasPorMetodo[metodo]) sumasPorMetodo[metodo] = 0;
    sumasPorMetodo[metodo] += Number(f.valor_pagado || 0);
  });
  totalesDia.value = {
    total: cerradas.reduce((acc, f) => acc + Number(f.valor_pagado || 0), 0),
    cantidad: cerradas.length,
    sumasPorMetodo
  }
}
/*
function calcularSumasPorMetodo(facturas) {
  return facturas.reduce((acc, factura) => {
    const metodo = factura.metodo_pago?.detalle || 'Otros'
    acc[metodo] = (acc[metodo] || 0) + Number(factura.valor_pagado || 0)
    return acc
  }, {})
}
*/

// Watcher para forzar mayúsculas y sin espacios
watch(placa, (val) => {
  if (typeof val === 'string') {
    let nueva = val.replace(/\s+/g, '').toUpperCase()
    if (nueva !== val) {
      placa.value = nueva
    }
  }
})

function formatFechaHora(fecha) {
  if (!fecha) return ''
  const d = typeof fecha === 'string' ? new Date(fecha.replace(' ', 'T')) : fecha
  if (isNaN(d)) return ''
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatMoneda(valor) {
  if (valor == null || isNaN(valor)) return '-'
  return `$${Number(valor).toLocaleString('es-CO')}`
}

function seleccionarTipo(id) {
  tipoSeleccionado.value = id
}

async function cargarTiposVehiculo() {
  try {
    const response = await api.get('/api/tipo-vehiculos')
    const data = response.data
    tiposVehiculo.value = Array.isArray(data) ? data : []
    if (tiposVehiculo.value.length > 0 && tiposVehiculo.value[0]) {
      tipoSeleccionado.value = tiposVehiculo.value[0].id
    } else {
      tipoSeleccionado.value = null
    }
  } catch {
    tiposVehiculo.value = []
    tipoSeleccionado.value = null
    $q.notify({ type: 'negative', message: 'Error cargando tipos de vehículo' })
  }
}

async function cargarFacturas() {
  loadingFacturas.value = true
  try {
    const response = await api.get('/api/facturas')
    const data = response.data
    // Ordenar por ID descendente (más reciente primero)
    facturas.value = Array.isArray(data) ? data.sort((a, b) => b.id - a.id) : []
  } catch {
    facturas.value = []
    $q.notify({ type: 'negative', message: 'Error cargando facturas' })
  } finally {
    loadingFacturas.value = false
  }
}


async function guardarRegistro() {
  if (!placa.value || !tipoSeleccionado.value) return
  Loading.show({ message: 'Validando placa...' })
  try {
    // Verificar que exista un cuadre abierto antes de permitir registrar entradas
    try {
      const cuadresRes = await api.get('/api/cuadres')
      const cuadresArr = Array.isArray(cuadresRes.data) ? cuadresRes.data : []
      const abierto = cuadresArr.find(c => c.estado === 'ABIERTO')
      if (!abierto) {
        Loading.hide()
        $q.notify({ type: 'negative', message: 'No hay cuadre de caja abierto. Abra un cuadre antes de registrar entradas.' })
        return
      }
    } catch {
      // Si falla la verificación, prevenir el registro por seguridad
      Loading.hide()
      $q.notify({ type: 'negative', message: 'No se pudo verificar el cuadre de caja. Intente de nuevo.' })
      return
    }
    // 1. Verificar si ya existe una factura ABIERTA para la placa
    const response = await api.get('/api/facturas')
    const abiertas = Array.isArray(response.data)
      ? response.data.filter(f => f.placa === placa.value && f.estado === 'ABIERTA')
      : []
    if (abiertas.length > 0) {
      // Mostrar modal de cobro
      facturaCobro.value = abiertas[0]
      metodoPagoId.value = metodoPagoDefault.value
      mostrarModalCobro.value = true
      await calcularValorCobro()
      Loading.hide()
      return
    }
    // Si no hay abierta, registrar entrada normalmente
    Loading.show({ message: 'Guardando entrada...' })
    const tipoVehiculo = tiposVehiculo.value.find(t => t.id === tipoSeleccionado.value)
    if (!tipoVehiculo) throw new Error('Tipo de vehículo inválido')
    const tarifaId = getTarifaIdPorTipoVehiculo(tipoSeleccionado.value)
    if (!tarifaId) throw new Error('No se encontró una tarifa activa para este tipo de vehículo')
    const payload = {
      placa: placa.value,
      tipo_vehiculo_id: tipoSeleccionado.value,
      tarifa_id: tarifaId,
      estado: 'ABIERTA'
    }
    const res = await api.post('/api/facturas', payload)
    $q.notify({ type: 'positive', message: 'Entrada registrada con exito' })
    placa.value = ''
    await cargarFacturas()
    await cargarTotalesDia()
    // Mostrar ticket de entrada
    facturaIdTicket.value = res.data?.data?.id || res.data?.id
    mostrarTicket.value = true
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Error al guardar' })
  } finally {
    Loading.hide()
  }
}

// Confirmar cobro y registrar salida
async function confirmarCobro() {
  if (!facturaCobro.value) return
  // Validación: asegurar que exista valor y método antes de intentar guardar
  if (!valorCobro.value || !metodoPagoId.value) {
    $q.notify({ type: 'negative', message: 'Debe digitar el valor y seleccionar un método de pago.' })
    return
  }
  Loading.show({ message: 'Registrando salida y cobro...' })
  try {
    // Verificar que exista un cuadre abierto antes de confirmar cobro
    try {
      const cuadresRes = await api.get('/api/cuadres')
      const cuadresArr = Array.isArray(cuadresRes.data) ? cuadresRes.data : []
      const abierto = cuadresArr.find(c => c.estado === 'ABIERTO')
      if (!abierto) {
        Loading.hide()
        $q.notify({ type: 'negative', message: 'No hay cuadre de caja abierto. Abra un cuadre antes de registrar cobros.' })
        return
      }
    } catch {
      Loading.hide()
      $q.notify({ type: 'negative', message: 'No se pudo verificar el cuadre de caja. Intente de nuevo.' })
      return
    }
    // Si el usuario digitó el valor manualmente, enviar valor_manual
    const payload = {
      valor_pagado: valorCobro.value,
      metodo_pago_id: metodoPagoId.value
    };
    if (valorManualActivo.value) {
      payload.valor_manual = valorCobro.value;
    }
    await api.post(`/api/facturas/${facturaCobro.value.id}/confirmar-cobro`, payload)
    $q.notify({ type: 'positive', message: 'Cobro registrado con éxito' })
    mostrarModalCobro.value = false
    facturaCobro.value = null
    placa.value = ''
    await cargarFacturas()
    await cargarTotalesDia()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Error al registrar cobro' })
  } finally {
    Loading.hide()
  }
}

function getTarifaIdPorTipoVehiculo(tipoVehiculoId) {
  // La tarifa_id es igual al tipo_vehiculo_id
  return tipoVehiculoId
}


onMounted(async () => {
  await cargarMensajeEmpresa();
  await cargarTiposVehiculo();
  await cargarFacturas();
  await metodosPagosStore.loadMetodosPagos();
  await tarifasStore.loadTarifas();
  await cargarTotalesDia();
})
</script>

<style lang="scss" scoped>
.my-page {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
}

/* CONTENEDOR DEL Q-INPUT */
.q-input-placa-grande {
  height: 220px;
}

/* ATRAVESAR EL SCOPE DE QUASAR */
.q-input-placa-grande::v-deep(.q-field__control) {
  height: 100% !important;
}

.q-input-placa-grande::v-deep(.q-field__control-container) {
  height: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* INPUT NATIVO */
.q-input-placa-grande::v-deep(.q-field__native) {
  font-size: 110px !important;
  font-weight: 800 !important;
  text-align: center !important;
  letter-spacing: 0.10em !important;
  text-transform: uppercase !important;
  padding: 0 !important;
  line-height: 1 !important;
  &::placeholder {
    color: #cacaca !important;
  }
}

/* MENSAJES */
.q-input-placa-grande::v-deep(.q-field__messages) {
  margin-top: 4px !important;
  padding-top: 0 !important;
}

.q-input-placa-grande::v-deep(.q-field__message) {
  margin-top: 4px !important;
}

/* SCROLL HORIZONTAL CHIPS */
.scroll-x {
  overflow-x: auto;
}

/* CHIPS VEHÍCULO */
.chip-vehiculo {
  min-width: 110px;
  min-height: 56px;
  font-size: 1.2rem;
  border-radius: 10px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-vehiculo .q-avatar {
  margin-right: 8px;
}

.chip-label {
  font-weight: 600;
}

/* Estilos para resaltar el valor a pagar en el modal */
.valor-cobro-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.valor-cobro-display {
  font-size: 2.4rem;
  font-weight: 800;
  color: #1b5e20; /* verde oscuro */
  background: #e8f5e9;
  padding: 10px 18px;
  border-radius: 8px;
  min-width: 220px;
  text-align: center;
}
.valor-cobro-input::v-deep(.q-field__native) {
  font-size: 1rem !important;
  font-weight: 600 !important;
}



</style>
