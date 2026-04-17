<template>
  <q-page padding>
    <q-card class="q-pa-md q-mb-md">
      <div class="text-h5">Reportes del sistema</div>
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-4">
          <q-input v-model="filtros.fecha" type="date" label="Filtrar por fecha de salida" filled clearable />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="filtros.metodoPago"
            :options="metodosPagoOptionsFiltrados"
            label="Filtrar por método de pago"
            filled
            clearable
            emit-value
            map-options
            option-value="value"
            option-label="label"
          />
        </div>
        <!-- Filtro por rango de horas eliminado -->

      </div>
      <div class="q-mt-md flex">
        <q-btn color="positive" label="Exportar CSV" @click="exportarCSV" class="q-mr-sm" />
        <q-btn color="primary" label="Exportar XLSX" @click="exportarXLSX" />
      </div>
    </q-card>
    <q-table
      :rows="facturasFiltradas"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
      class="q-mt-md"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="placa" :props="props">{{ props.row.placa }}</q-td>
          <q-td key="fecha_entrada" :props="props">{{ formatFecha(props.row.fecha_entrada) }}</q-td>
          <q-td key="hora_entrada" :props="props">{{ formatHora(props.row.fecha_entrada) }}</q-td>
          <q-td key="fecha_salida" :props="props">{{ formatFecha(props.row.fecha_salida) }}</q-td>
          <q-td key="hora_salida" :props="props">{{ formatHora(props.row.fecha_salida) }}</q-td>
          <q-td key="tiempo_transcurrido" :props="props">{{ calcularTiempoTranscurrido(props.row.fecha_entrada, props.row.fecha_salida) }}</q-td>
          <q-td key="valor_calculado" :props="props">{{ formatMoneda(props.row.valor_calculado) }}</q-td>
          <q-td key="valor_pagado" :props="props">{{ formatMoneda(props.row.valor_pagado) }}</q-td>
          <q-td key="metodo_pago" :props="props">{{ props.row.metodo_pago?.detalle || '-' }}</q-td>
          <q-td key="estado" :props="props">
            <span :style="props.row.estado === 'CERRADA' ? 'color: #c82333; font-weight: bold;' : ''">{{ props.row.estado }}</span>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const facturas = ref([])
const loading = ref(false)
const filtros = ref({ fecha: '', metodoPago: null, horaDesde: null, horaHasta: null })
const metodosPagoOptions = ref([])
const metodosPagoOptionsFiltrados = computed(() => metodosPagoOptions.value)

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left' },
  { name: 'fecha_entrada', label: 'Fecha Entrada', field: 'fecha_entrada', align: 'left' },
  { name: 'hora_entrada', label: 'Hora Entrada', field: 'fecha_entrada', align: 'left' },
  { name: 'fecha_salida', label: 'Fecha Salida', field: 'fecha_salida', align: 'left' },
  { name: 'hora_salida', label: 'Hora Salida', field: 'fecha_salida', align: 'left' },
  { name: 'tiempo_transcurrido', label: 'Tiempo transcurrido', field: row => calcularTiempoTranscurrido(row.fecha_entrada, row.fecha_salida), align: 'left' },
  { name: 'valor_calculado', label: 'Valor Calculado', field: 'valor_calculado', align: 'right' },
  { name: 'valor_pagado', label: 'Valor Pagado', field: 'valor_pagado', align: 'right' },
  { name: 'metodo_pago', label: 'Método de Pago', field: row => row.metodo_pago?.detalle || '-', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
]
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

function formatMoneda(valor) {
  if (valor == null || isNaN(valor)) return '-'
  return `$${Number(valor).toLocaleString('es-CO')}`
}

const facturasFiltradas = computed(() => {
  return facturas.value.filter(f => {
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
    if (filtros.value.metodoPago && String(filtros.value.metodoPago).trim() !== '') {
      if (!f.metodo_pago || String(f.metodo_pago.detalle).trim() !== String(filtros.value.metodoPago).trim()) {
        return false
      }
    }
    return true
  })
})

function exportarCSV() {
  const rows = facturasFiltradas.value
  if (!rows.length) {
    $q.notify({ type: 'warning', message: 'No hay datos para exportar' })
    return
  }
  const header = columns.map(c => c.label).join(',')
  const csv = rows.map(row => {
    return columns.map(c => {
      let val = typeof c.field === 'function' ? c.field(row) : row[c.field]
      return `"${val ?? ''}"`
    }).join(',')
  })
  const blob = new Blob([header + '\n' + csv.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'reportes_facturas.csv'
  a.click()
  URL.revokeObjectURL(url)
}

async function cargarFacturas() {
  loading.value = true
  try {
    const response = await api.get('/api/facturas')
    facturas.value = Array.isArray(response.data) ? response.data : []

    // Extraer métodos de pago únicos
    const metodos = [...new Set(facturas.value.map(f => f.metodo_pago?.detalle).filter(Boolean))]
    if (metodos.length === 0) {
      $q.notify({ type: 'warning', message: 'No se encontraron métodos de pago en las facturas.' })
    }
    metodosPagoOptions.value = metodos.map(m => ({ label: m, value: m }))
  } catch {
    facturas.value = []
    metodosPagoOptions.value = []
    $q.notify({ type: 'negative', message: 'Error cargando facturas o métodos de pago.' })
  } finally {
    loading.value = false
  }
}

onMounted(cargarFacturas)
import * as XLSX from 'xlsx'

function exportarXLSX() {
  const rows = facturasFiltradas.value
  if (!rows.length) {
    $q.notify({ type: 'warning', message: 'No hay datos para exportar' })
    return
  }
  // Generar datos por columnas
  const data = rows.map(row => {
    const obj = {}
    columns.forEach(c => {
      obj[c.label] = typeof c.field === 'function' ? c.field(row) : row[c.field]
    })
    return obj
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reportes')
  XLSX.writeFile(wb, 'reportes_facturas.xlsx')
}

</script>
