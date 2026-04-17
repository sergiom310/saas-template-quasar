<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Reportes de Usuario</div>
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-4">
            <q-input v-model="filtros.fecha" label="Fecha de salida" type="date" filled clearable />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.formaPago"
              :options="opcionesFormaPago"
              label="Forma de pago"
              filled
              clearable
              emit-value
              map-options
              option-value="value"
              option-label="label"
            />
          </div>
          <div class="col-12 col-md-4 flex flex-center">
            <q-btn color="primary" label="Imprimir Diario Detallado" @click="imprimirDiarioDetallado" class="q-mr-sm" />
            <q-btn color="secondary" label="Imprimir Diario Resumido" @click="imprimirDiarioResumido" />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table :rows="facturasFiltradas" :columns="columnas" row-key="id">
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <span :style="props.value === 'CERRADA' ? 'color: #c82333; font-weight: bold;' : ''">{{ props.value }}</span>
              </q-td>
          </template>
        </q-table>
        <div class="q-mt-sm text-right" style="font-size: 1.2em; font-weight: bold;">
          Total Recibido Por Parqueo: $
          {{ (Array.isArray(facturasFiltradas) ? facturasFiltradas : []).reduce((acc, f) => acc + (Number(f.valor_pagado) || 0), 0).toLocaleString('es-CO') }}
        </div>
      </q-card-section>
      <!-- Tabla de pagos de mensualidades debajo de la tabla de salidas -->
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Pagos de mensualidades</div>
        <q-table
          :rows="pagosFiltrados"
          :columns="columnsPagos"
          row-key="id_pago"
          :rows-per-page="5"
          records-per-page-label="Records per page:"
        >
          <!-- Ejemplo de slot personalizado para la columna 'forma_pago' -->
          <template v-slot:body-cell-forma_pago="props">
            <q-td :props="props">
              <span>{{ props.value || '-' }}</span>
            </q-td>
          </template>
        </q-table>
        <div class="q-mt-sm text-right" style="font-size: 1.2em; font-weight: bold;">
          Total mensualidades: $
          {{ (Array.isArray(pagosFiltrados) ? pagosFiltrados : []).reduce((acc, p) => acc + (Number(p.val_pag) || 0), 0).toLocaleString('es-CO') }}
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'
import { usePagosStore } from 'src/stores/pagos'
import { useQuasar } from 'quasar'
const $q = useQuasar()

const facturas = ref([])
const loading = ref(false)
const filtros = ref({ fecha: '', formaPago: null })
const metodosPagoOptions = ref([])

// Inicializar el store de pagos
const pagosStore = usePagosStore()
// pagos es un computed que obtiene los pagos del store
const pagos = computed(() => Array.isArray(pagosStore.pagos) ? pagosStore.pagos : [])

// Si tienes un store, reemplaza la siguiente línea por la obtención real de los pagos:
// const pagos = computed(() => pagosStore.pagos || [])

const opcionesFormaPago = computed(() => metodosPagoOptions.value.map(opt => {
  const detalle = opt.label || opt.detalle || opt.value;
  return { label: detalle, value: detalle };
}))

const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left' },
  { name: 'fecha_entrada', label: 'Fecha Entrada', field: row => formatFecha(row.fecha_entrada), align: 'left' },
  { name: 'hora_entrada', label: 'Hora Entrada', field: row => formatHora(row.fecha_entrada), align: 'left' },
  { name: 'fecha_salida', label: 'Fecha Salida', field: row => formatFecha(row.fecha_salida), align: 'left' },
  { name: 'hora_salida', label: 'Hora Salida', field: row => formatHora(row.fecha_salida), align: 'left' },
  { name: 'tiempo_transcurrido', label: 'Tiempo transcurrido', field: row => calcularTiempoTranscurrido(row.fecha_entrada, row.fecha_salida), align: 'left' },
  { name: 'valor_calculado', label: 'Valor Calculado', field: 'valor_calculado', align: 'right' },
  { name: 'valor_pagado', label: 'Valor Pagado', field: 'valor_pagado', align: 'right' },
  { name: 'metodo_pago', label: 'Método de Pago', field: row => row.metodo_pago?.detalle || '-', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
]

const columnsPagos = [
  { name: 'id_pago', align: 'left', label: 'ID', field: 'id_pago', sortable: true },
  { name: 'cod_cli', align: 'left', label: 'Código Cliente', field: 'cod_cli', sortable: true },
  { name: 'nom_cli', align: 'left', label: 'Cliente', field: row => row.cliente?.nom_cli, sortable: true },
  { name: 'val_pag', align: 'right', label: 'Monto', field: 'val_pag', sortable: true },
  { name: 'fecha_pag', align: 'left', label: 'Fecha Pago', field: row => formatFechaPago(row.fecha_pag), sortable: true },
  { name: 'forma_pago', align: 'left', label: 'Forma Pago', field: row => row.metodo_pago?.detalle, sortable: true },
  { name: 'desde', align: 'left', label: 'Desde', field: row => formatFechaPago(row.desde), sortable: true },
  { name: 'hasta', align: 'left', label: 'Hasta', field: row => formatFechaPago(row.hasta), sortable: true },
]

function formatFechaPago(fecha) {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('T')[0].split('-')
  return `${dia}-${mes}-${anio}`
}

const facturasFiltradas = computed(() => {
  const resultado = facturas.value.filter(f => {
    if (f.estado !== 'CERRADA') return false
    if (filtros.value.fecha) {
      if (!f.fecha_salida) return false
      let salida = typeof f.fecha_salida === 'string' ? f.fecha_salida.split(' ')[0].trim() : ''
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(salida)) {
        const [d, m, y] = salida.split('/')
        salida = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
      }
      if (salida !== filtros.value.fecha) {
        const [filtroY, filtroM, filtroD] = filtros.value.fecha.split('-').map(Number)
        let salidaY, salidaM, salidaD
        if (/^\d{4}-\d{2}-\d{2}$/.test(salida)) {
          [salidaY, salidaM, salidaD] = salida.split('-').map(Number)
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(salida)) {
          const [d, m, y] = salida.split('/')
          salidaY = Number(y)
          salidaM = Number(m)
          salidaD = Number(d)
        } else {
          const dateSalida = new Date(salida)
          salidaY = dateSalida.getFullYear()
          salidaM = dateSalida.getMonth() + 1
          salidaD = dateSalida.getDate()
        }
        if (salidaY !== filtroY || salidaM !== filtroM || salidaD !== filtroD) {
          return false
        }
      }
    }
    if (filtros.value.formaPago && String(filtros.value.formaPago).trim() !== '') {
      // Depuración: mostrar valores en consola
      console.log('Filtro formaPago:', filtros.value.formaPago, '| Factura metodo_pago.detalle:', f.metodo_pago?.detalle)
      if (!f.metodo_pago || String(f.metodo_pago.detalle).trim() !== String(filtros.value.formaPago).trim()) return false
    }
    return true
  })
  // Depuración: mostrar resultado
  console.log('Facturas filtradas:', resultado)
  return resultado
})

function calcularTiempoTranscurrido(fechaEntrada, fechaSalida) {
  if (!fechaEntrada || !fechaSalida) return '-';
  const entrada = new Date(fechaEntrada.replace(' ', 'T'));
  const salida = new Date(fechaSalida.replace(' ', 'T'));
  if (isNaN(entrada) || isNaN(salida)) return '-';
  let diff = Math.floor((salida - entrada) / 1000); // segundos
  const horas = Math.floor(diff / 3600);
  diff = diff % 3600;
  const minutos = Math.floor(diff / 60);
  return `${horas}h ${minutos}m`;
}

function formatFecha(fecha) {
  if (!fecha) return ''
  const d = typeof fecha === 'string' ? new Date(fecha.replace(' ', 'T')) : fecha
  if (isNaN(d)) return ''
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

function formatHora(fecha) {
  if (!fecha) return ''
  const d = typeof fecha === 'string' ? new Date(fecha.replace(' ', 'T')) : fecha
  if (isNaN(d)) return ''
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function cargarFacturas() {
  loading.value = true
  try {
    const response = await api.get('/api/facturas')
    facturas.value = Array.isArray(response.data) ? response.data : []
    const metodos = [...new Set(facturas.value.map(f => f.metodo_pago?.detalle).filter(Boolean))]
    metodosPagoOptions.value = metodos.map(m => ({ label: m, value: m }))
    // Cargar pagos mensualidades
    await pagosStore.loadPagos()
  } catch {
    facturas.value = []
  } finally {
    loading.value = false
  }
}
// Pagos mensualidades filtrados por fecha y forma de pago
const pagosFiltrados = computed(() => {
  let pagosFiltrados = pagos.value;
  if (filtros.value.fecha) {
    pagosFiltrados = pagosFiltrados.filter(p => {
      if (!p.fecha_pag) return false;
      // Formatear fecha_pag a yyyy-mm-dd
      let fechaPago = '';
      if (/^\d{2}-\d{2}-\d{4}$/.test(p.fecha_pag)) {
        // dd-mm-yyyy
        const [d, m, y] = p.fecha_pag.split('-');
        fechaPago = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(p.fecha_pag)) {
        fechaPago = p.fecha_pag;
      } else {
        // Intentar parsear como Date
        const date = new Date(p.fecha_pag);
        if (!isNaN(date)) {
          fechaPago = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        }
      }
      return fechaPago === filtros.value.fecha;
    });
  }
  if (filtros.value.formaPago && String(filtros.value.formaPago).trim() !== '') {
    // Depuración: mostrar valores en consola
    pagosFiltrados.forEach(p => {
      console.log('Filtro formaPago:', filtros.value.formaPago, '| Pago metodo_pago.detalle:', p.metodo_pago?.detalle)
    })
    pagosFiltrados = pagosFiltrados.filter(p => p.metodo_pago && String(p.metodo_pago.detalle).trim() === String(filtros.value.formaPago).trim());
  }
  // Depuración: mostrar resultado
  console.log('Pagos filtrados:', pagosFiltrados)
  return pagosFiltrados;
});

function imprimirDiarioDetallado() {
  if (!filtros.value.fecha) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar una fecha de salida para imprimir el reporte.',
      position: 'top',
      color: 'warning',
      icon: 'event_busy',
      timeout: 2500
    });
    return;
  }
  const rows = facturasFiltradas.value;
  if (!rows.length) {
    $q.notify({
      type: 'info',
      message: 'No hay datos para imprimir',
      position: 'top',
      color: 'info',
      icon: 'info',
      timeout: 2500
    });
    return;
  }
  let total = 0;
  let html = `<div style='font-family: monospace; font-size: 13px; width: 260px;'>`;
  html += `<div style='text-align:center;font-weight:bold;font-size:16px;'>Diario Detallado</div>`;
  html += `<hr />`;
  html += `<table style='width:100%;font-size:12px;text-align:left;'>`;
  html += `<tr><th>Placa</th><th>Tiempo</th><th>Valor</th><th>Pago</th></tr>`;
  rows.forEach(row => {
    total += Number(row.valor_pagado) || 0;
    html += `<tr>`;
    html += `<td>${row.placa}</td>`;
    html += `<td>${calcularTiempoTranscurrido(row.fecha_entrada, row.fecha_salida)}</td>`;
    html += `<td style='text-align:right;'>$${Number(row.valor_pagado).toLocaleString('es-CO')}</td>`;
    html += `<td>${row.metodo_pago?.detalle || '-'}</td>`;
    html += `</tr>`;
  });
  html += `</table>`;
  html += `<hr />`;
  html += `<div style='text-align:right;font-size:18px;'><b>Total: $${total.toLocaleString('es-CO')}</b></div>`;
  html += `<div style='text-align:center;font-size:12px;'>Total registros: ${rows.length}</div>`;

  // Pagos mensualidades del día
  if (pagosFiltrados.value.length) {
    html += `<hr />`;
    html += `<div style='text-align:center;font-weight:bold;font-size:15px;'>Pagos de mensualidades</div>`;
    html += `<table style='width:100%;font-size:12px;text-align:left;'>`;
    html += `<tr><th>Cliente</th><th>Valor</th><th>Pago</th></tr>`;
    let totalMensualidades = 0;
    pagosFiltrados.value.forEach(p => {
      totalMensualidades += Number(p.val_pag) || 0;
      html += `<tr>`;
      html += `<td>${p.cliente?.nom_cli || '-'}</td>`;
      html += `<td style='text-align:right;'>$${Number(p.val_pag).toLocaleString('es-CO')}</td>`;
      html += `<td>${p.metodo_pago?.detalle || '-'}</td>`;
      html += `</tr>`;
    });
    html += `</table>`;
    html += `<div style='text-align:right;font-size:16px;'><b>Total mensualidades: $${totalMensualidades.toLocaleString('es-CO')}</b></div>`;
  }
  html += `</div>`;
  const printWindow = window.open('', '', 'width=350,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Diario Detallado</title>
        <style>
          @media print {
            body { margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 2px 4px; }
          }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function imprimirDiarioResumido() {
  if (!filtros.value.fecha) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar una fecha de salida para imprimir el reporte.',
      position: 'top',
      color: 'warning',
      icon: 'event_busy',
      timeout: 2500
    });
    return;
  }
  const rows = facturasFiltradas.value;
  if (!rows.length) {
    $q.notify({
      type: 'info',
      message: 'No hay datos para imprimir',
      position: 'top',
      color: 'info',
      icon: 'info',
      timeout: 2500
    });
    return;
  }
  // Agrupar por método de pago
  const resumen = {};
  rows.forEach(row => {
    const metodo = row.metodo_pago?.detalle || 'Otro';
    if (!resumen[metodo]) resumen[metodo] = 0;
    resumen[metodo] += Number(row.valor_pagado) || 0;
  });
  let html = `<div style='font-family: monospace; font-size: 13px; width: 260px;'>`;
  html += `<div style='text-align:center;font-weight:bold;font-size:16px;'>Diario Resumido</div>`;
  html += `<hr />`;
  html += `<table style='width:100%;font-size:12px;text-align:left;'>`;
  html += `<tr><th>Forma de Pago</th><th>Total</th></tr>`;
  Object.entries(resumen).forEach(([metodo, total]) => {
    html += `<tr>`;
    html += `<td>${metodo}</td>`;
    html += `<td style='text-align:right;'>$${total.toLocaleString('es-CO')}</td>`;
    html += `</tr>`;
  });
  html += `</table>`;
  // Total general
  const totalGeneral = Object.values(resumen).reduce((a, b) => a + b, 0);
  html += `<hr />`;
  html += `<div style='text-align:right;font-size:18px;'><b>Total: $${totalGeneral.toLocaleString('es-CO')}</b></div>`;
  html += `<div style='text-align:center;font-size:12px;'>Total métodos: ${Object.keys(resumen).length}</div>`;

  // Resumen mensualidades por forma de pago
  if (pagosFiltrados.value.length) {
    html += `<hr />`;
    html += `<div style='text-align:center;font-weight:bold;font-size:15px;'>Resumen mensualidades</div>`;
    // Agrupar mensualidades por forma de pago
    const resumenMensualidades = {};
    pagosFiltrados.value.forEach(p => {
      const metodo = p.metodo_pago?.detalle || 'Otro';
      if (!resumenMensualidades[metodo]) resumenMensualidades[metodo] = 0;
      resumenMensualidades[metodo] += Number(p.val_pag) || 0;
    });
    html += `<table style='width:100%;font-size:12px;text-align:left;'>`;
    html += `<tr><th>Forma de Pago</th><th>Total</th></tr>`;
    Object.entries(resumenMensualidades).forEach(([metodo, total]) => {
      html += `<tr>`;
      html += `<td>${metodo}</td>`;
      html += `<td style='text-align:right;'>$${total.toLocaleString('es-CO')}</td>`;
      html += `</tr>`;
    });
    html += `</table>`;
    const totalMensualidades = Object.values(resumenMensualidades).reduce((a, b) => a + b, 0);
    html += `<div style='text-align:right;font-size:16px;'><b>Total mensualidades: $${totalMensualidades.toLocaleString('es-CO')}</b></div>`;
    html += `<div style='text-align:center;font-size:12px;'>Total métodos: ${Object.keys(resumenMensualidades).length}</div>`;
  }
  html += `</div>`;
  const printWindow = window.open('', '', 'width=350,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Diario Resumido</title>
        <style>
          @media print {
            body { margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 2px 4px; }
          }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

onMounted(async () => {
  await cargarFacturas();
  // Depuración: mostrar pagos cargados
  console.log('Pagos cargados:', pagosStore.pagos);
});

watch(
  () => pagos.value,
  (val) => {
    console.log('Pagos actuales:', val);
    console.log('Pagos filtrados:', pagosFiltrados.value);
  },
  { immediate: true }
)
</script>
