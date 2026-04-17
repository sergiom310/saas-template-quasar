<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="event" />
      <q-toolbar-title> Agendar Citas </q-toolbar-title>
    </q-toolbar>

    <div class="q-pa-md">
      <!-- Filtros superiores -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-md-6 col-xs-12">
          <q-select
            outlined
            v-model="selectedProfesional"
            :options="profesionales"
            option-value="id_profesional"
            option-label="nombre"
            emit-value
            map-options
            label="Seleccionar Profesional"
            @update:model-value="onProfesionalChange"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-select>
        </div>
        <div class="col-md-6 col-xs-12">
          <q-input
            outlined
            v-model="selectedDate"
            label="Seleccionar Fecha"
            @update:model-value="onDateChange"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date 
                    v-model="selectedDate" 
                    :options="dateOptions"
                    default-year-month="2026/02"
                    today-btn
                    title="Seleccionar Fecha"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <!-- Mensaje si no hay selección -->
      <div v-if="!selectedProfesional || !selectedDate" class="text-center q-pa-xl">
        <q-icon name="info" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-6 q-mt-md">
          Seleccione un profesional y una fecha para ver la disponibilidad
        </div>
      </div>

      <!-- Grilla de franjas horarias -->
      <div v-else class="row q-col-gutter-md">
        <div
          v-for="franja in disponibilidad"
          :key="franja.id_franja"
          class="col-lg-3 col-md-4 col-sm-6 col-xs-12"
        >
          <q-card
            :class="getCardClass(franja)"
            @click="franja.disponible ? openReservaDialog(franja) : showAgendaInfo(franja)"
          >
            <q-card-section class="text-center">
              <q-icon
                :name="getIconName(franja)"
                :color="getIconColor(franja)"
                size="md"
              />
              <div class="text-h6 q-mt-sm">
                {{ formatTimeAMPM(franja.hora_inicio) }} - {{ formatTimeAMPM(franja.hora_fin) }}
              </div>
              <div class="text-caption" :class="getTextClass(franja)">
                {{ getEstadoTexto(franja) }}
              </div>

              <!-- Información adicional si está ocupado o atendido -->
              <div v-if="!franja.disponible && franja.agenda" class="q-mt-sm text-caption text-grey-8">
                <div><strong>Cliente:</strong> {{ franja.agenda.cliente }}</div>
                <div class="text-truncate"><strong>Procedimiento:</strong> {{ franja.agenda.procedimiento }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Diálogo para ver información de agenda ocupada -->
    <q-dialog v-model="dialogInfo">
      <q-card style="width: 600px; max-width: 80vw">
        <q-card-section class="row items-center bg-red-1">
          <q-icon name="event_busy" size="sm" class="q-mr-sm" color="negative" />
          <span class="text-h6">Información de la Cita</span>
        </q-card-section>

        <q-card-section v-if="selectedAgendaInfo">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-subtitle2">Fecha y Hora</div>
              <div class="text-body2 text-grey-8">
                {{ formatDate(selectedDate) }} - {{ formatTimeAMPM(selectedAgendaInfo.hora_inicio) }} a {{ formatTimeAMPM(selectedAgendaInfo.hora_fin) }}
              </div>
            </div>

            <div class="col-12">
              <div class="text-subtitle2">Profesional</div>
              <div class="text-body2 text-grey-8">
                {{ getProfesionalNombre(selectedProfesional) }}
              </div>
            </div>

            <div class="col-12">
              <div class="text-subtitle2">Cliente</div>
              <div class="text-body2 text-grey-8">
                {{ selectedAgendaInfo.agenda.cliente }}
              </div>
            </div>

            <div class="col-12">
              <div class="text-subtitle2">Procedimiento</div>
              <div class="text-body2 text-grey-8">
                {{ selectedAgendaInfo.agenda.procedimiento }}
              </div>
            </div>

            <div class="col-12">
              <div class="text-subtitle2">Estado</div>
              <q-badge :color="getEstadoColor(selectedAgendaInfo.agenda.estado)">
                {{ getEstadoLabel(selectedAgendaInfo.agenda.estado) }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" @click="dialogInfo = false" />
          <q-btn
            flat
            label="Recibir Pago"
            color="positive"
            icon="payments"
            @click="abrirDialogoPago"
            v-if="selectedAgendaInfo && selectedAgendaInfo.agenda.estado !== 'cancelado' && selectedAgendaInfo.agenda.estado !== 'atendido'"
          />
          <q-btn
            flat
            label="Cambiar Cita"
            color="secondary"
            icon="swap_horiz"
            @click="abrirCambiarCita"
            v-if="selectedAgendaInfo && selectedAgendaInfo.agenda.estado !== 'cancelado' && selectedAgendaInfo.agenda.estado !== 'atendido'"
          />
          <q-btn
            flat
            label="Cancelar Cita"
            color="negative"
            @click="confirmarCancelar"
            v-if="selectedAgendaInfo && selectedAgendaInfo.agenda.estado !== 'cancelado' && selectedAgendaInfo.agenda.estado !== 'atendido'"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para crear reserva -->
    <q-dialog v-model="dialogReserva" persistent>
      <q-card style="width: 600px; max-width: 80vw">
        <q-card-section class="row items-center">
          <q-icon name="event_available" size="sm" class="q-mr-sm" color="primary" />
          <span class="text-h6">Nueva Reserva</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="saveReserva">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-subtitle2">Fecha y Hora</div>
                <div class="text-body2 text-grey-7">
                  {{ formatDate(selectedDate) }} - {{ formatTimeAMPM(selectedFranja?.hora_inicio) }} a {{ formatTimeAMPM(selectedFranja?.hora_fin) }}
                </div>
              </div>

              <div class="col-12">
                <div class="text-subtitle2">Profesional</div>
                <div class="text-body2 text-grey-7">
                  {{ getProfesionalNombre(selectedProfesional) }}
                </div>
              </div>

              <div class="col-12">
                <div class="row q-gutter-sm items-end">
                  <div class="col">
                    <q-select
                      outlined
                      v-model="reservaForm.id_cliente"
                      :options="clientes"
                      option-value="id_cliente"
                      option-label="nombre"
                      emit-value
                      map-options
                      label="Cliente *"
                      :rules="[(val) => !!val || 'Campo requerido']"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-select>
                  </div>
                  <div>
                    <q-btn
                      round
                      color="positive"
                      icon="add"
                      size="md"
                      @click="openNuevoClienteDialog"
                      style="margin-bottom: 2px;"
                    >
                      <q-tooltip>Agregar nuevo cliente</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  v-model="reservaForm.procedimiento"
                  label="Procedimiento / Observaciones"
                  type="textarea"
                  rows="3"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="closeReservaDialog" />
            <q-btn flat label="Confirmar Reserva" color="positive" type="submit" icon="check" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo para cambiar cita -->
    <q-dialog v-model="dialogCambiar" persistent>
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section class="row items-center bg-secondary text-white">
          <q-icon name="swap_horiz" size="sm" class="q-mr-sm" />
          <span class="text-h6">Cambiar Cita</span>
        </q-card-section>

        <q-form ref="formCambiarRef" @submit.prevent="saveCambio">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 q-mb-md">
                <div class="text-caption text-grey-7">
                  Seleccione la nueva fecha, profesional y franja horaria para reprogramar la cita.
                </div>
              </div>

              <div class="col-md-6 col-xs-12">
                <q-input
                  outlined
                  v-model="cambiarForm.fecha"
                  label="Nueva Fecha *"
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date 
                          v-model="cambiarForm.fecha" 
                          :options="dateOptions"
                          default-year-month="2026/02"
                          today-btn
                          title="Seleccionar Nueva Fecha"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-md-6 col-xs-12">
                <q-select
                  outlined
                  v-model="cambiarForm.id_profesional"
                  :options="profesionales"
                  option-value="id_profesional"
                  option-label="nombre"
                  emit-value
                  map-options
                  label="Nuevo Profesional *"
                  :rules="[(val) => !!val || 'Campo requerido']"
                  @update:model-value="onCambiarProfesionalChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-select>
              </div>

              <div class="col-12" v-if="disponibilidadCambio.length > 0">
                <div class="text-subtitle2 q-mb-sm">Seleccionar Nueva Franja Horaria</div>
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="franja in disponibilidadCambio"
                    :key="franja.id_franja"
                    class="col-lg-3 col-md-4 col-sm-6 col-xs-12"
                  >
                    <q-card
                      v-if="franja.disponible"
                      :class="cambiarForm.id_franja === franja.id_franja ? 'bg-secondary text-white cursor-pointer' : 'bg-green-1 cursor-pointer'"
                      @click="cambiarForm.id_franja = franja.id_franja"
                    >
                      <q-card-section class="text-center q-pa-sm">
                        <div class="text-body2">
                          {{ formatTimeAMPM(franja.hora_inicio) }} - {{ formatTimeAMPM(franja.hora_fin) }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <div class="col-12" v-else-if="cambiarForm.fecha && cambiarForm.id_profesional">
                <q-banner class="bg-grey-2">
                  <template v-slot:avatar>
                    <q-icon name="info" color="grey-7" />
                  </template>
                  No hay franjas disponibles para la fecha y profesional seleccionados
                </q-banner>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="closeCambiarDialog" />
            <q-btn
              flat
              label="Confirmar Cambio"
              color="secondary"
              type="submit"
              icon="check"
              :disable="!cambiarForm.id_franja"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo para crear nuevo cliente -->
    <q-dialog v-model="dialogNuevoCliente" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center bg-positive text-white">
          <q-icon name="person_add" size="sm" class="q-mr-sm" />
          <span class="text-h6">Nuevo Cliente</span>
        </q-card-section>

        <q-form ref="formClienteRef" @submit.prevent="saveNuevoCliente">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  outlined
                  v-model="nuevoClienteForm.nombre"
                  label="Nombre Completo *"
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  v-model="nuevoClienteForm.cedula"
                  label="Cédula / Identificación"
                >
                  <template v-slot:prepend>
                    <q-icon name="credit_card" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  v-model="nuevoClienteForm.telefono"
                  label="Teléfono *"
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  v-model="nuevoClienteForm.observaciones"
                  label="Observaciones"
                  type="textarea"
                  rows="3"
                >
                  <template v-slot:prepend>
                    <q-icon name="notes" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="closeNuevoClienteDialog" />
            <q-btn flat label="Guardar Cliente" color="positive" type="submit" icon="check" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo para recibir pago -->
    <q-dialog v-model="dialogPago" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center bg-positive text-white">
          <q-icon name="payments" size="sm" class="q-mr-sm" />
          <span class="text-h6">Recibir Pago</span>
        </q-card-section>

        <q-form @submit="guardarPago" ref="formPagoRef">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Cliente</div>
                <div class="text-body1 text-weight-medium">
                  {{ selectedAgendaInfo?.agenda?.cliente }}
                </div>
              </div>

              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Procedimiento</div>
                <div class="text-body1 text-grey-8">
                  {{ selectedAgendaInfo?.agenda?.procedimiento }}
                </div>
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  v-model.number="pagoForm.monto"
                  type="number"
                  step="0.01"
                  min="0"
                  label="Monto a pagar *"
                  prefix="$"
                  :rules="[
                    (val) => val !== null && val !== '' || 'Campo requerido',
                    (val) => val > 0 || 'El monto debe ser mayor a 0'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-select
                  outlined
                  v-model="pagoForm.metodo_pago"
                  :options="metodosPagoOptions"
                  option-value="id"
                  option-label="detalle"
                  emit-value
                  map-options
                  label="Método de pago *"
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="credit_card" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="closePagoDialog" />
            <q-btn flat label="Registrar Pago" color="positive" type="submit" icon="check" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAgendaStore } from 'src/stores/agenda'
import { useMetodosAgdPagosStore } from 'src/stores/MetodosAgdPagos'
import { usePagoStore } from 'src/stores/pago'
import { date, useQuasar } from 'quasar'

const agendaStore = useAgendaStore()
const metodosAgdPagosStore = useMetodosAgdPagosStore()
const pagoStore = usePagoStore()
const $q = useQuasar()

const selectedProfesional = ref(null)
const selectedDate = ref(null)
const selectedFranja = ref(null)
const selectedAgendaInfo = ref(null)
const dialogReserva = ref(false)
const dialogInfo = ref(false)
const dialogCambiar = ref(false)
const dialogPago = ref(false)
const dialogNuevoCliente = ref(false)
const formRef = ref(null)
const formCambiarRef = ref(null)
const formClienteRef = ref(null)

const reservaForm = ref({
  id_cliente: null,
  procedimiento: ''
})

const nuevoClienteForm = ref({
  cedula: '',
  nombre: '',
  telefono: '',
  observaciones: ''
})

const cambiarForm = ref({
  fecha: null,
  id_profesional: null,
  id_franja: null,
  id_cliente: null, // ID del cliente de la cita actual
  procedimiento: '' // Procedimiento de la cita actual
})

const pagoForm = ref({
  monto: null,
  metodo_pago: null
})

const formPagoRef = ref(null)

const disponibilidadCambio = ref([])

const profesionales = computed(() => agendaStore.profesionales)
const clientes = computed(() => agendaStore.clientes)
const disponibilidad = computed(() => agendaStore.disponibilidad)
const metodosPagoOptions = computed(() => metodosAgdPagosStore.metodosPagos)

// Opciones de fechas (solo fechas futuras y hoy)
const dateOptions = () => {
  // Habilitar todas las fechas (incluyendo días anteriores para revisiones)
  return true
}

// Watch para actualizar disponibilidad cuando cambian profesional o fecha
watch([selectedProfesional, selectedDate], async ([newProf, newDate], [oldProf, oldDate]) => {
  if (newProf && newDate) {
    // Solo cargar si realmente cambió algo
    if (newProf !== oldProf || newDate !== oldDate) {
      await agendaStore.loadDisponibilidad(newDate, newProf)
    }
  }
})

const onProfesionalChange = async () => {
  if (selectedProfesional.value && selectedDate.value) {
    await agendaStore.loadDisponibilidad(selectedDate.value, selectedProfesional.value)
  }
}

const onDateChange = async () => {
  if (selectedProfesional.value && selectedDate.value) {
    await agendaStore.loadDisponibilidad(selectedDate.value, selectedProfesional.value)
  }
}

const showAgendaInfo = (franja) => {
  selectedAgendaInfo.value = franja
  dialogInfo.value = true
}

const confirmarCancelar = () => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de cancelar esta cita?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await agendaStore.cambiarEstado(selectedAgendaInfo.value.agenda.id_agenda, 'cancelado')
    dialogInfo.value = false
    selectedAgendaInfo.value = null
  })
}

const abrirDialogoPago = async () => {
  dialogInfo.value = false
  pagoForm.value = {
    monto: null,
    metodo_pago: null
  }
  await metodosAgdPagosStore.loadMetodosPagos()
  dialogPago.value = true
}

const closePagoDialog = () => {
  dialogPago.value = false
  pagoForm.value = {
    monto: null,
    metodo_pago: null
  }
}

const guardarPago = async () => {
  const isValid = await formPagoRef.value.validate()
  if (!isValid) {
    return
  }

  try {
    const payload = {
      id_agenda: selectedAgendaInfo.value.agenda.id_agenda,
      monto: pagoForm.value.monto,
      metodo_pago: pagoForm.value.metodo_pago
    }

    await pagoStore.createPago(payload)

    closePagoDialog()
    selectedAgendaInfo.value = null

    // Recargar disponibilidad
    if (selectedProfesional.value && selectedDate.value) {
      await agendaStore.loadDisponibilidad(selectedDate.value, selectedProfesional.value)
    }
  } catch (error) {
    console.error('Error al registrar pago:', error)
  }
}

const getEstadoColor = (estado) => {
  const colors = {
    reservado: 'primary',
    atendido: 'positive',
    cancelado: 'negative'
  }
  return colors[estado] || 'grey'
}

const getEstadoLabel = (estado) => {
  const labels = {
    reservado: 'Reservado',
    atendido: 'Atendido',
    cancelado: 'Cancelado'
  }
  return labels[estado] || estado
}

const getCardClass = (franja) => {
  if (franja.disponible) {
    return 'cursor-pointer bg-green-1'
  }
  if (franja.agenda?.estado === 'atendido') {
    return 'cursor-pointer bg-orange-1'
  }
  return 'cursor-pointer bg-red-1'
}

const getIconName = (franja) => {
  if (franja.disponible) {
    return 'check_circle'
  }
  if (franja.agenda?.estado === 'atendido') {
    return 'check_circle_outline'
  }
  return 'cancel'
}

const getIconColor = (franja) => {
  if (franja.disponible) {
    return 'positive'
  }
  if (franja.agenda?.estado === 'atendido') {
    return 'orange'
  }
  return 'negative'
}

const getTextClass = (franja) => {
  if (franja.disponible) {
    return 'text-positive'
  }
  if (franja.agenda?.estado === 'atendido') {
    return 'text-orange'
  }
  return 'text-negative'
}

const getEstadoTexto = (franja) => {
  if (franja.disponible) {
    return 'Disponible'
  }
  if (franja.agenda?.estado === 'atendido') {
    return 'Atendido'
  }
  return 'Ocupado'
}

const openReservaDialog = (franja) => {
  selectedFranja.value = franja
  reservaForm.value = {
    id_cliente: null,
    procedimiento: ''
  }
  dialogReserva.value = true
}

const closeReservaDialog = () => {
  dialogReserva.value = false
  selectedFranja.value = null
  reservaForm.value = {
    id_cliente: null,
    procedimiento: ''
  }
}

const saveReserva = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  const payload = {
    fecha: selectedDate.value,
    id_franja: selectedFranja.value.id_franja,
    id_profesional: selectedProfesional.value,
    id_cliente: reservaForm.value.id_cliente,
    procedimiento: reservaForm.value.procedimiento,
    estado: 'reservado'
  }

  await agendaStore.addAgenda(payload)
  closeReservaDialog()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return date.formatDate(dateStr, 'DD/MM/YYYY')
}

const getProfesionalNombre = (id) => {
  const profesional = profesionales.value.find(p => p.id_profesional === id)
  return profesional ? profesional.nombre : ''
}

// Función para convertir hora de 24h a formato AM/PM
const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Función para abrir el diálogo de cambiar cita
const abrirCambiarCita = () => {
  // Guardar datos de la cita actual antes de cerrar el diálogo
  const citaActual = selectedAgendaInfo.value.agenda

  dialogInfo.value = false
  cambiarForm.value = {
    fecha: date.formatDate(new Date(), 'YYYY/MM/DD'),
    id_profesional: null,
    id_franja: null,
    id_cliente: citaActual.id_cliente,
    procedimiento: citaActual.procedimiento,
    id_agenda_actual: citaActual.id_agenda
  }
  disponibilidadCambio.value = []
  dialogCambiar.value = true
}

// Watch para cargar disponibilidad cuando cambian fecha o profesional en el form de cambio
watch(() => cambiarForm.value.fecha, async (newFecha) => {
  if (newFecha && cambiarForm.value.id_profesional) {
    const result = await agendaStore.loadDisponibilidadTemp(newFecha, cambiarForm.value.id_profesional)
    disponibilidadCambio.value = result
  }
})

const onCambiarProfesionalChange = async () => {
  if (cambiarForm.value.fecha && cambiarForm.value.id_profesional) {
    const result = await agendaStore.loadDisponibilidadTemp(cambiarForm.value.fecha, cambiarForm.value.id_profesional)
    disponibilidadCambio.value = result
  }
}

const closeCambiarDialog = () => {
  dialogCambiar.value = false
  cambiarForm.value = {
    fecha: null,
    id_profesional: null,
    id_franja: null,
    id_cliente: null,
    procedimiento: '',
    id_agenda_actual: null
  }
  disponibilidadCambio.value = []
}

const saveCambio = async () => {
  const isValid = await formCambiarRef.value.validate()
  if (!isValid) {
    return
  }

  try {
    // Primero cancelar la cita actual
    await agendaStore.cambiarEstado(cambiarForm.value.id_agenda_actual, 'cancelado')

    // Luego crear una nueva cita con la nueva fecha/hora
    const nuevaCitaPayload = {
      fecha: cambiarForm.value.fecha,
      id_franja: cambiarForm.value.id_franja,
      id_profesional: cambiarForm.value.id_profesional,
      id_cliente: cambiarForm.value.id_cliente,
      procedimiento: cambiarForm.value.procedimiento,
      estado: 'reservado'
    }

    await agendaStore.addAgenda(nuevaCitaPayload, false) // false = no mostrar notificación

    // Mostrar mensaje personalizado para cambio de cita
    $q.notify({
      type: 'positive',
      message: 'Cita movida exitosamente a la nueva fecha y hora',
      icon: 'event_available'
    })

    closeCambiarDialog()
    selectedAgendaInfo.value = null
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar la cita',
      icon: 'error'
    })
  }
}

const openNuevoClienteDialog = () => {
  nuevoClienteForm.value = {
    cedula: '',
    nombre: '',
    telefono: '',
    observaciones: ''
  }
  dialogNuevoCliente.value = true
}

const closeNuevoClienteDialog = () => {
  dialogNuevoCliente.value = false
  nuevoClienteForm.value = {
    cedula: '',
    nombre: '',
    telefono: '',
    observaciones: ''
  }
}

const saveNuevoCliente = async () => {
  const isValid = await formClienteRef.value.validate()
  if (!isValid) {
    return
  }

  const nuevoCliente = await agendaStore.addCliente(nuevoClienteForm.value)
  
  // Esperar a que se actualice la lista de clientes y el DOM
  await nextTick()
  
  // Seleccionar automáticamente el cliente recién creado
  // Manejar diferentes estructuras de respuesta del servidor
  const clienteId = nuevoCliente?.id_cliente || nuevoCliente?.data?.id_cliente || nuevoCliente?.id
  
  if (clienteId) {
    reservaForm.value.id_cliente = clienteId
  }
  
  closeNuevoClienteDialog()
}

onMounted(async () => {
  await agendaStore.loadProfesionales()
  await agendaStore.loadClientes()
  await metodosAgdPagosStore.loadMetodosPagos()
  // Establecer fecha actual por defecto
  selectedDate.value = date.formatDate(new Date(), 'YYYY/MM/DD')
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

/* Asegurar que el header del datepicker siempre sea visible */
:deep(.q-date__header) {
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.q-date__header-title) {
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.q-date__view) {
  opacity: 1 !important;
}
</style>
