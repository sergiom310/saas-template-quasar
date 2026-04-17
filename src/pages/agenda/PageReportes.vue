<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="assessment" />
      <q-toolbar-title> Reportes de Ingresos y Gastos </q-toolbar-title>
    </q-toolbar>

    <div class="q-pa-md">
      <!-- Filtros -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Filtros</div>
          <div class="row q-col-gutter-md">
            <div class="col-md-4 col-xs-12">
              <q-input
                outlined
                v-model="filtros.fecha_inicio"
                label="Fecha Inicio"
                type="date"
              />
            </div>
            <div class="col-md-4 col-xs-12">
              <q-input
                outlined
                v-model="filtros.fecha_fin"
                label="Fecha Fin"
                type="date"
              />
            </div>
            <div class="col-md-4 col-xs-12">
              <q-select
                outlined
                v-model="filtros.id_profesional"
                :options="profesionales"
                option-value="id_profesional"
                option-label="nombre"
                emit-value
                map-options
                clearable
                label="Profesional (Todos)"
              />
            </div>
            <div class="col-12 text-right">
              <q-btn color="primary" label="Generar Reporte" icon="search" @click="cargarReporte" :loading="loading" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Totales -->
      <div class="row q-col-gutter-md q-mb-md" v-if="reporteGenerado">
        <div class="col-md-4 col-xs-12">
          <q-card class="bg-positive text-white">
            <q-card-section>
              <div class="text-h6">Total Ingresos</div>
              <div class="text-h4">${{ formatearNumero(totales.ingresos) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-md-4 col-xs-12">
          <q-card class="bg-negative text-white">
            <q-card-section>
              <div class="text-h6">Total Gastos</div>
              <div class="text-h4">${{ formatearNumero(totales.gastos) }}</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-md-4 col-xs-12">
          <q-card :class="totales.balance >= 0 ? 'bg-info text-white' : 'bg-warning text-white'">
            <q-card-section>
              <div class="text-h6">Balance Final</div>
              <div class="text-h4">${{ formatearNumero(totales.balance) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <q-card class="q-mb-md" v-if="reporteGenerado && totales.ingresos === 0 && totales.gastos === 0">
        <q-card-section class="text-center">
          <q-icon name="info" size="3em" color="grey-5" class="q-mb-md" />
          <div class="text-h6 text-grey-7">No hay datos para el rango de fechas seleccionado</div>
          <div class="text-caption text-grey-6">Intenta con otras fechas o profesional</div>
        </q-card-section>
      </q-card>

      <!-- Gráfico -->
      <q-card class="q-mb-md" v-if="reporteGenerado && (datosGrafico.ingresos_por_dia.length > 0 || datosGrafico.gastos_por_dia.length > 0)">
        <q-card-section>
          <div class="text-h6 q-mb-md">Evolución de Ingresos y Gastos</div>
          <canvas ref="chartCanvas"></canvas>
        </q-card-section>
      </q-card>

      <!-- Botones de descarga -->
      <q-card class="q-mb-md" v-if="reporteGenerado">
        <q-card-section>
          <div class="text-h6 q-mb-md">Descargar Reportes</div>
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <div class="text-subtitle2 q-mb-sm">Reporte Detallado</div>
              <q-btn color="red" icon="picture_as_pdf" label="PDF" @click="descargarPDFDetallado" class="q-mr-sm" />
              <q-btn color="green" icon="description" label="Excel" @click="descargarExcelDetallado" />
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-subtitle2 q-mb-sm">Reporte Resumido</div>
              <q-btn color="red" icon="picture_as_pdf" label="PDF" @click="descargarPDFResumido" class="q-mr-sm" />
              <q-btn color="green" icon="description" label="Excel" @click="descargarExcelResumido" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Resumen por método de pago y profesional -->
      <div class="row q-col-gutter-md" v-if="reporteGenerado">
        <div class="col-md-6 col-xs-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Ingresos por Método de Pago</div>
              <q-list separator>
                <q-item v-for="metodo in ingresosPorMetodo" :key="metodo.metodo">
                  <q-item-section>
                    <q-item-label>{{ metodo.metodo }}</q-item-label>
                    <q-item-label caption>{{ metodo.cantidad }} pagos</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label class="text-positive text-weight-bold">${{ formatearNumero(metodo.total) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-md-6 col-xs-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">Ingresos por Profesional</div>
              <q-list separator>
                <q-item v-for="prof in ingresosPorProfesional" :key="prof.profesional">
                  <q-item-section>
                    <q-item-label>{{ prof.profesional }}</q-item-label>
                    <q-item-label caption>{{ prof.cantidad }} citas</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label class="text-positive text-weight-bold">${{ formatearNumero(prof.total) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const loading = ref(false)
const reporteGenerado = ref(false)
const filtros = ref({
  fecha_inicio: '',
  fecha_fin: '',
  id_profesional: null
})
const profesionales = ref([])
const totales = ref({ ingresos: 0, gastos: 0, balance: 0 })
const ingresosPorMetodo = ref([])
const ingresosPorProfesional = ref([])
const datosGrafico = ref({ ingresos_por_dia: [], gastos_por_dia: [] })
const chartCanvas = ref(null)
let chartInstance = null

const setDefaultDates = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const fechaHoy = `${year}-${month}-${day}`
  filtros.value.fecha_inicio = fechaHoy
  filtros.value.fecha_fin = fechaHoy
}

const formatearNumero = (numero) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero)
}

const cargarProfesionales = async () => {
  try {
    console.log('Cargando profesionales...')
    const response = await api.get('/api/profesionales')
    const profesionalesActivos = response.data.filter(p => p.activo == 1)
    profesionales.value = profesionalesActivos

    // Si hay un solo profesional, seleccionarlo automáticamente
    if (profesionalesActivos.length === 1) {
      filtros.value.id_profesional = profesionalesActivos[0].id_profesional
      console.log('Auto-seleccionado profesional único:', profesionalesActivos[0].nombre)
    }
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar profesionales' })
  }
}

const cargarReporte = async () => {
  if (!filtros.value.fecha_inicio || !filtros.value.fecha_fin) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar un rango de fechas' })
    return
  }

  loading.value = true
  try {
    const params = {
      fecha_inicio: filtros.value.fecha_inicio,
      fecha_fin: filtros.value.fecha_fin
    }
    if (filtros.value.id_profesional) {
      params.id_profesional = filtros.value.id_profesional
    }

    console.log('Generando reporte con parámetros:', params)
    const response = await api.get('/api/reportes/datos', { params })
    console.log('Respuesta del reporte:', response.data)

    if (response.data) {
      totales.value = response.data.totales || { ingresos: 0, gastos: 0, balance: 0 }
      ingresosPorMetodo.value = response.data.ingresos_por_metodo || []
      ingresosPorProfesional.value = response.data.ingresos_por_profesional || []
      datosGrafico.value = response.data.grafico || { ingresos_por_dia: [], gastos_por_dia: [] }
      reporteGenerado.value = true

      await nextTick()
      renderChart()

      Notify.create({
        type: 'positive',
        message: 'Reporte generado correctamente',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Error al cargar el reporte:', error)
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al cargar el reporte',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const renderChart = () => {
  if (!chartCanvas.value) {
    console.warn('Canvas no disponible para renderizar gráfico')
    return
  }

  try {
    if (chartInstance) {
      chartInstance.destroy()
    }

    const fechas = [...new Set([
      ...datosGrafico.value.ingresos_por_dia.map(d => d.fecha),
      ...datosGrafico.value.gastos_por_dia.map(d => d.fecha)
    ])].sort()

    const ingresosData = fechas.map(fecha => {
      const item = datosGrafico.value.ingresos_por_dia.find(d => d.fecha === fecha)
      return item ? Number(item.total) : 0
    })

    const gastosData = fechas.map(fecha => {
      const item = datosGrafico.value.gastos_por_dia.find(d => d.fecha === fecha)
      return item ? Number(item.total) : 0
    })

    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: fechas,
        datasets: [
          {
            label: 'Ingresos',
            data: ingresosData,
            borderColor: '#21BA45',
            backgroundColor: 'rgba(33, 186, 69, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Gastos',
            data: gastosData,
            borderColor: '#C10015',
            backgroundColor: 'rgba(193, 0, 21, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Ingresos vs Gastos por Día'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || ''
                if (label) {
                  label += ': '
                }
                if (context.parsed.y !== null) {
                  label += '$' + context.parsed.y.toFixed(2)
                }
                return label
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(0)
              }
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error al renderizar gráfico:', error)
    Notify.create({
      type: 'warning',
      message: 'No se pudo renderizar el gráfico',
      position: 'top'
    })
  }
}

const descargarPDFDetallado = async () => {
  if (!reporteGenerado.value) {
    Notify.create({ type: 'warning', message: 'Primero genera un reporte' })
    return
  }
  Loading.show({ message: 'Generando PDF...' })
  try {
    const params = {
      fecha_inicio: filtros.value.fecha_inicio,
      fecha_fin: filtros.value.fecha_fin
    }
    if (filtros.value.id_profesional) {
      params.id_profesional = filtros.value.id_profesional
    }

    const response = await api.get('/api/reportes/pdf-detallado', {
      params,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-detallado-${new Date().getTime()}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al generar el PDF'
    })
  } finally {
    Loading.hide()
  }
}

const descargarPDFResumido = async () => {
  if (!reporteGenerado.value) {
    Notify.create({ type: 'warning', message: 'Primero genera un reporte' })
    return
  }
  Loading.show({ message: 'Generando PDF...' })
  try {
    const params = {
      fecha_inicio: filtros.value.fecha_inicio,
      fecha_fin: filtros.value.fecha_fin
    }
    if (filtros.value.id_profesional) {
      params.id_profesional = filtros.value.id_profesional
    }

    const response = await api.get('/api/reportes/pdf-resumido', {
      params,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-resumido-${new Date().getTime()}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al generar el PDF'
    })
  } finally {
    Loading.hide()
  }
}

const descargarExcelDetallado = async () => {
  if (!reporteGenerado.value) {
    Notify.create({ type: 'warning', message: 'Primero genera un reporte' })
    return
  }
  Loading.show({ message: 'Generando Excel...' })
  try {
    const params = {
      fecha_inicio: filtros.value.fecha_inicio,
      fecha_fin: filtros.value.fecha_fin
    }
    if (filtros.value.id_profesional) {
      params.id_profesional = filtros.value.id_profesional
    }

    const response = await api.get('/api/reportes/excel-detallado', {
      params,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-detallado-${new Date().getTime()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar Excel:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al generar el Excel'
    })
  } finally {
    Loading.hide()
  }
}

const descargarExcelResumido = async () => {
  if (!reporteGenerado.value) {
    Notify.create({ type: 'warning', message: 'Primero genera un reporte' })
    return
  }
  Loading.show({ message: 'Generando Excel...' })
  try {
    const params = {
      fecha_inicio: filtros.value.fecha_inicio,
      fecha_fin: filtros.value.fecha_fin
    }
    if (filtros.value.id_profesional) {
      params.id_profesional = filtros.value.id_profesional
    }

    const response = await api.get('/api/reportes/excel-resumido', {
      params,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-resumido-${new Date().getTime()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar Excel:', error)
    Notify.create({
      type: 'negative',
      message: 'Error al generar el Excel'
    })
  } finally {
    Loading.hide()
  }
}

onMounted(() => {
  setDefaultDates()
  cargarProfesionales()
})
</script>
