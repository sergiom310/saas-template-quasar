<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-col-gutter-md">
      <div class="col">
        <div class="text-h6">Cuadre de caja</div>
        <div class="text-subtitle2">Abrir / cerrar cuadre y ver historial</div>
      </div>
      <div class="col-auto">
        <q-btn
          v-if="!cuadreAbierto"
          color="positive"
          :loading="loading"
          :disable="loading"
          @click="abrirCuadre"
          label="Abrir cuadre"
          icon="play_arrow"
          unelevated
          class="shadow-2 q-mr-md export-btn"
          style="min-width:200px"
          aria-label="Abrir cuadre"
        >
          <q-tooltip>Abrir cuadre de caja</q-tooltip>
        </q-btn>

        <q-btn
          v-else
          color="negative"
          :loading="loading"
          :disable="loading"
          @click="cerrarCuadre(cuadreAbierto.id_cuadre)"
          label="Cerrar cuadre"
          icon="check"
          unelevated
          class="shadow-2 q-mr-md export-btn close-btn"
          style="min-width:200px"
          aria-label="Cerrar cuadre"
        >
          <q-tooltip>Cerrar cuadre y calcular totales</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <div v-if="cuadreAbierto">
      <q-card>
        <q-card-section>
          <div class="text-subtitle1">Cuadre abierto por: <strong>{{ cuadreAbierto.usuario }}</strong></div>
            <div>Abierto: {{ formatFechaHora(cuadreAbierto.fecha_apertura) }}</div>
            <div>Base: <strong>{{ formatMoneda(cuadreAbierto.base) }}</strong></div>
          <div v-if="resumen">
            <div class="q-mt-sm">Ingresos Parqueadero: <strong>{{ formatMoneda(resumen.parqueadero) }}</strong></div>
            <div>Ingresos Mensualidades: <strong>{{ formatMoneda(resumen.mensualidades) }}</strong></div>
            <div>Total: <strong>{{ formatMoneda(resumen.total) }}</strong></div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-separator class="q-my-md" />

    <div>
      <div class="text-h6">Historial de cuadres</div>
      <q-table :rows="cuadres" :columns="columns" row-key="id_cuadre" flat>
        <template v-slot:body-cell-fecha_cierre="props">
          <q-td :props="props">{{ props.row.fecha_cierre ? formatFechaHora(props.row.fecha_cierre) : '-' }}</q-td>
        </template>
        <template v-slot:body-cell-total_ingresos="props">
          <q-td :props="props">{{ formatMoneda(props.row.total_ingresos) }}</q-td>
        </template>
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <span :class="['state-pill', props.row.estado === 'ABIERTO' ? 'open' : 'closed']">
              {{ props.row.estado }}
            </span>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.estado === 'CERRADO'"
              color="primary"
              icon="print"
              label="Imprimir cierre"
              unelevated
              class="print-btn"
              @click="printCierre(props.row.id_cuadre)"
            />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { date, useQuasar } from 'quasar'

const cuadres = ref([])
const cuadreAbierto = ref(null)
const resumen = ref(null)
const loading = ref(false)

const $q = useQuasar()

const columns = [
  { name: 'id', label: 'ID', field: 'id_cuadre' },
  { name: 'usuario', label: 'Usuario', field: 'usuario' },
  { name: 'fecha_apertura', label: 'Apertura', field: 'fecha_apertura' },
  { name: 'fecha_cierre', label: 'Cierre', field: 'fecha_cierre' },
  { name: 'total_ingresos', label: 'Total ingresos', field: 'total_ingresos' },
  { name: 'estado', label: 'Estado', field: 'estado' },
  { name: 'actions', label: 'Acciones', field: 'actions', sortable: false },
]

function formatFechaHora(v) {
  if (!v) return ''
  return date.formatDate(v, 'DD/MM/YYYY HH:mm')
}

function formatMoneda(v) {
  if (v == null) return ''
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadCuadres() {
  const { data } = await api.get('/api/cuadres')
  cuadres.value = data || []
  cuadreAbierto.value = cuadres.value.find(c => c.estado === 'ABIERTO') || null
  if (cuadreAbierto.value) await loadResumen(cuadreAbierto.value.id_cuadre)
}

async function loadResumen(id) {
  const { data } = await api.get(`/api/cuadres/${id}/resumen`)
  resumen.value = data || { parqueadero: 0, mensualidades: 0, total: 0 }
}

async function abrirCuadre() {
  try {
    const dlg = $q.dialog({
      title: 'Base inicial',
      message: 'Ingrese el valor de la base al abrir el cuadre (opcional)',
      cancel: true,
      prompt: {
        model: null,
        type: 'number',
        // permitir vacío o número >= 0 (a veces no hay base)
        isValid: val => val === null || val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
        label: 'Base',
      },
    })

    dlg.onOk(async baseVal => {
      loading.value = true
      const base = Number(baseVal) || 0
      await api.post('/api/cuadres', { base })
      await loadCuadres()
      loading.value = false
    })

    dlg.onCancel(() => {
      // user cancelled
    })
  } catch (err) {
    loading.value = false
    console.error('abrirCuadre error', err)
    try {
      $q.notify({ type: 'negative', message: 'Error abriendo cuadre' })
    } catch {
      /* noop */
    }
  }
}

async function cerrarCuadre(id) {
  try {
    loading.value = true
    await api.post(`/api/cuadres/${id}/close`)
    await loadCuadres()
  } finally {
    loading.value = false
  }
}

async function printCierre(id) {
  try {
    const { data } = await api.get(`/api/cuadres/${id}/detalle`)
    const detalle = data || {}

    const esc = (s) => (s == null ? '' : String(s))
    const fmt = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    // Agrupar pagos por método
    const pagosParque = detalle.pagos_parqueadero || []
    const pagosMens = detalle.pagos_mensualidad || []
    const detalles = detalle.detalles || []

    const groupByMetodo = (list) => {
      const map = {}
      list.forEach(item => {
        const metodoName = (item.metodo || item.detalle || (`Metodo ${item.metodo_pago_id ?? '0'}`))
        if (!map[metodoName]) map[metodoName] = { items: [], total: 0 }
        map[metodoName].items.push(item)
        map[metodoName].total += Number(item.valor || item.total || 0)
      })
      return map
    }

    const facturasByMetodo = groupByMetodo(pagosParque)
    const mensualByMetodo = groupByMetodo(pagosMens)

    // Totales por método inicializados desde cuadre_detalle si existe
    const totals = {}
    detalles.forEach(d => {
      const name = d.metodo || d.detalle || (`Metodo ${d.metodo_pago_id ?? '0'}`)
      totals[name] = (totals[name] || 0) + Number(d.total || 0)
    })

    // Añadir totales calculados directamente desde listados (por si faltan en cuadre_detalle)
    Object.keys(facturasByMetodo).forEach(k => { totals[k] = (totals[k] || 0) + Number(facturasByMetodo[k].total || 0) })
    Object.keys(mensualByMetodo).forEach(k => { totals[k] = (totals[k] || 0) + Number(mensualByMetodo[k].total || 0) })

    // Agregar base (siempre en efectivo)
    const baseVal = Number(detalle.cuadre?.base ?? detalle.base ?? 0)
    const efectivoKey = 'EFECTIVO'
    totals[efectivoKey] = (totals[efectivoKey] || 0) + baseVal

    // HTML: tamaño de letra un poco mayor
    let html = '<div style="font-family: monospace; width:360px; padding:10px; font-size:14px">'
    html += `<div style="text-align:center; font-weight:700; font-size:16px; margin-bottom:8px">CUADRE DE CAJA</div>`
    html += `<div>Cuadre #: ${esc(id)}</div>`
    html += `<div>Usuario: ${esc(detalle.usuario || detalle.cuadre?.usuario || '')}</div>`
    html += `<div>Apertura: ${esc(detalle.fecha_apertura || detalle.cuadre?.fecha_apertura || '')}</div>`
    html += `<div>Cierre: ${esc(detalle.fecha_cierre || detalle.cuadre?.fecha_cierre || '')}</div>`
    html += '<hr />'

    // Facturas agrupadas por método
    if (Object.keys(facturasByMetodo).length) {
      html += '<div style="font-weight:700; margin-bottom:6px">Facturas por forma de pago</div>'
      Object.keys(facturasByMetodo).forEach(met => {
        const group = facturasByMetodo[met]
        html += `<div style="font-weight:700">${esc(met)} - ${fmt(group.total)}</div>`
        group.items.forEach(p => {
          const desc = esc(p.id_factura ? `Factura ${p.id_factura}` : 'Pago parqueadero')
          html += `<div style="display:flex; justify-content:space-between"><span>${desc}</span><span>${fmt(p.valor)}</span></div>`
        })
        html += '<div style="height:6px"></div>'
      })
      html += '<hr />'
    }

    // Mensualidades agrupadas por método
    if (Object.keys(mensualByMetodo).length) {
      html += '<div style="font-weight:700; margin-bottom:6px">Mensualidades por forma de pago</div>'
      Object.keys(mensualByMetodo).forEach(met => {
        const group = mensualByMetodo[met]
        html += `<div style="font-weight:700">${esc(met)} - ${fmt(group.total)}</div>`
        group.items.forEach(p => {
          const cliente = esc(p.cliente || p.id_cliente || '')
          const periodo = esc(p.periodo || '')
          html += `<div style="display:flex; justify-content:space-between"><span>${cliente} ${periodo}</span><span>${fmt(p.valor)}</span></div>`
        })
        html += '<div style="height:6px"></div>'
      })
      html += '<hr />'
    }

    // Mostrar base (efectivo)
    html += `<div style="display:flex; justify-content:space-between; font-weight:700"><span>Base (EFECTIVO)</span><span>${fmt(baseVal)}</span></div>`
    html += '<hr />'

    // Totales por forma de pago
    html += '<div style="font-weight:700; margin-bottom:6px">Totales por forma de pago</div>'
    Object.keys(totals).forEach(k => {
      html += `<div style="display:flex; justify-content:space-between"><span>${esc(k)}</span><span>${fmt(totals[k])}</span></div>`
    })
    html += '<hr />'

    // Total general
    const totalGeneral = Object.values(totals).reduce((s, v) => s + Number(v || 0), 0)
    html += `<div style="display:flex; justify-content:space-between; font-weight:900; font-size:15px"><span>TOTAL</span><span>${fmt(totalGeneral)}</span></div>`
    html += '</div>'

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  } catch (e) {
    console.error('printCierre error', e)
    // mostrar notificación al usuario
    try {
      $q.notify({ type: 'negative', message: 'Error imprimiendo cierre' })
    } catch (notifyErr) {
      console.error('notify error', notifyErr)
    }
  }
}

onMounted(() => {
  loadCuadres()
})
</script>

<style scoped>
.q-page { min-height: 100%; }

.export-btn {
  padding: 10px 18px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 6px;
  color: #ffffff !important;
  background-color: #10B981 !important; /* verde explícito */
  border: none !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.18);
}
.export-btn:hover {
  filter: brightness(0.95);
}

.close-btn {
  background-color: #EF4444 !important; /* rojo explícito */
  color: #ffffff !important;
  border: none !important;
}
.close-btn:hover { filter: brightness(0.95); }

.state-pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 10px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  border: 1px solid transparent;
}
.state-pill.open {
  background-color: #E6FFFA; /* light mint */
  color: #059669; /* green */
  border-color: #BBF7D0;
}
.state-pill.closed {
  background-color: #FEF2F2; /* light pink */
  color: #DC2626; /* red */
  border-color: #FECACA;
}

.print-btn {
  padding: 8px 14px !important;
  min-width: 150px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 6px;
}
</style>
