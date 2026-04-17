<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="calendar_month" />
      <q-toolbar-title> Calendario de Citas </q-toolbar-title>
    </q-toolbar>

    <div class="q-pa-md">
      <!-- Controles de navegación -->
      <div class="row items-center q-mb-md">
        <q-btn flat icon="chevron_left" @click="previousMonth" />
        <div class="col text-center text-h6">
          {{ monthName }} {{ currentYear }}
        </div>
        <q-btn flat icon="chevron_right" @click="nextMonth" />
        <q-space />
        <q-btn color="primary" label="Hoy" @click="goToToday" />
      </div>

      <!-- Calendario -->
      <div class="calendar-container">
        <!-- Días de la semana -->
        <div class="calendar-header row">
          <div v-for="day in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" :key="day" class="col text-center text-weight-bold">
            {{ day }}
          </div>
        </div>

        <!-- Días del mes -->
        <div class="calendar-body">
          <div class="row" v-for="week in calendarWeeks" :key="week[0].date">
            <div
              v-for="day in week"
              :key="day.date"
              class="col calendar-day"
              :class="{
                'other-month': !day.isCurrentMonth,
                'today': day.isToday
              }"
              @click="showDayAppointments(day)"
            >
              <div class="day-header">{{ day.dayNumber }}</div>
              <div class="appointments-list">
                <div
                  v-for="appointment in day.appointments"
                  :key="appointment.id_agenda"
                  class="appointment-item"
                  :class="getAppointmentClass(appointment.estado)"
                  @click.stop="showAppointmentDetail(appointment)"
                >
                  <div class="appointment-time">{{ formatTimeAMPM(appointment.hora_inicio) }}</div>
                  <div class="appointment-client">{{ appointment.cliente_nombre }}</div>
                  <div class="appointment-procedure text-caption">{{ appointment.procedimiento }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de citas del día -->
    <q-dialog v-model="dayDialog" maximized transition-show="slide-up" transition-hide="slide-down" class="day-dialog-mobile">
      <q-card class="day-appointments-card">
        <q-card-section class="row items-center bg-blue-grey-4 text-white q-pa-sm">
          <q-icon name="event" size="sm" class="q-mr-sm" />
          <span class="text-subtitle1">Citas del {{ selectedDayFormatted }}</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedDayAppointments.length > 0" class="q-pa-none">
          <q-list separator>
            <q-item
              v-for="appointment in selectedDayAppointments"
              :key="appointment.id_agenda"
              clickable
              @click="showAppointmentDetailFromDay(appointment)"
              class="appointment-day-item q-pa-md"
            >
              <q-item-section avatar>
                <q-avatar :color="getStatusColor(appointment.estado)" text-color="white" icon="event" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-body1">{{ appointment.cliente_nombre }}</q-item-label>
                <q-item-label caption class="text-body2">
                  {{ formatTimeAMPM(appointment.hora_inicio) }} - {{ formatTimeAMPM(appointment.hora_fin) }}
                </q-item-label>
                <q-item-label caption class="text-caption">
                  {{ appointment.procedimiento }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  :color="getStatusColor(appointment.estado)"
                  text-color="white"
                  dense
                  class="text-caption"
                >
                  {{ appointment.estado }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section v-else>
          <div class="text-center text-grey-6">
            <q-icon name="event_busy" size="64px" />
            <div class="q-mt-sm">No hay citas agendadas para este día</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de detalles -->
    <q-dialog v-model="detailDialog">
      <q-card style="min-width: 350px; max-width: 90vw; width: 100%">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="event" size="md" class="q-mr-sm" />
          <span class="text-h6">Detalles de la Cita</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedAppointment">
          <div class="q-mb-sm">
            <div class="text-weight-bold text-grey-7">Cliente</div>
            <div class="text-h6">{{ selectedAppointment.cliente_nombre }}</div>
          </div>

          <q-separator class="q-my-md" />

          <div class="q-mb-sm">
            <div class="text-weight-bold text-grey-7">Fecha y Hora</div>
            <div>{{ formatDate(selectedAppointment.fecha) }}</div>
            <div>{{ formatTimeAMPM(selectedAppointment.hora_inicio) }} - {{ formatTimeAMPM(selectedAppointment.hora_fin) }}</div>
          </div>

          <q-separator class="q-my-md" />

          <div class="q-mb-sm">
            <div class="text-weight-bold text-grey-7">Profesional</div>
            <div>{{ selectedAppointment.profesional_nombre }}</div>
          </div>

          <q-separator class="q-my-md" />

          <div class="q-mb-sm">
            <div class="text-weight-bold text-grey-7">Procedimiento</div>
            <div>{{ selectedAppointment.procedimiento }}</div>
          </div>

          <q-separator class="q-my-md" />

          <div class="q-mb-sm">
            <div class="text-weight-bold text-grey-7">Estado</div>
            <q-chip
              :color="getStatusColor(selectedAppointment.estado)"
              text-color="white"
              dense
            >
              {{ selectedAppointment.estado }}
            </q-chip>
          </div>

          <div v-if="selectedAppointment.telefono" class="q-mb-sm">
            <div class="text-weight-bold text-grey-7">Teléfono</div>
            <div>{{ selectedAppointment.telefono }}</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

const currentDate = ref(new Date())
const appointments = ref([])
const detailDialog = ref(false)
const selectedAppointment = ref(null)
const dayDialog = ref(false)
const selectedDay = ref(null)
const selectedDayAppointments = ref([])

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const monthName = computed(() => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[currentMonth.value]
})

const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Ajustar para que la semana empiece en lunes (1 = lunes, 0 = domingo)
  let startDay = firstDay.getDay()
  startDay = startDay === 0 ? 6 : startDay - 1

  const weeks = []
  let week = []

  // Días del mes anterior
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    week.push({
      date: `${year}-${month}-${day}`,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: false,
      appointments: []
    })
  }

  // Días del mes actual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const today = new Date()
    const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const dayAppointments = appointments.value.filter(apt => {
      const aptDate = apt.fecha.split('T')[0]
      return aptDate === dateStr
    }).sort((a, b) => {
      // Ordenar por hora_inicio de menor a mayor
      return a.hora_inicio.localeCompare(b.hora_inicio)
    })

    week.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday,
      appointments: dayAppointments
    })

    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  // Días del mes siguiente
  if (week.length > 0) {
    let nextDay = 1
    while (week.length < 7) {
      week.push({
        date: `${year}-${month + 2}-${nextDay}`,
        dayNumber: nextDay,
        isCurrentMonth: false,
        isToday: false,
        appointments: []
      })
      nextDay++
    }
    weeks.push(week)
  }

  return weeks
})

const loadAppointments = async () => {
  Loading.show({ message: 'Cargando citas...' })
  try {
    const year = currentYear.value
    const month = currentMonth.value + 1
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0)
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`

    const response = await api.get('/api/agenda', {
      params: {
        fecha_inicio: startDate,
        fecha_fin: endDateStr
      }
    })

    // Transformar datos para incluir información completa
    // Solo mostrar citas reservadas y atendidas (excluir canceladas)
    appointments.value = response.data
      .filter(apt => apt.estado === 'reservado' || apt.estado === 'atendido')
      .map(apt => ({
        id_agenda: apt.id_agenda,
        fecha: apt.fecha,
        hora_inicio: apt.franja_horaria?.hora_inicio || 'N/A',
        hora_fin: apt.franja_horaria?.hora_fin || 'N/A',
        cliente_nombre: apt.cliente?.nombre || 'Sin cliente',
        telefono: apt.cliente?.telefono || '',
        profesional_nombre: apt.profesional?.nombre || 'Sin profesional',
        procedimiento: apt.procedimiento || 'Sin procedimiento',
        estado: apt.estado || 'reservado'
      }))
  } catch (error) {
    showErrorMessage(error.response?.data?.errors)
  } finally {
    Loading.hide()
  }
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  loadAppointments()
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
  loadAppointments()
}

const goToToday = () => {
  currentDate.value = new Date()
  loadAppointments()
}

const showAppointmentDetail = (appointment) => {
  selectedAppointment.value = appointment
  detailDialog.value = true
}

const showDayAppointments = (day) => {
  if (!day.isCurrentMonth) return
  selectedDay.value = day
  selectedDayAppointments.value = day.appointments
  dayDialog.value = true
}

const showAppointmentDetailFromDay = (appointment) => {
  dayDialog.value = false
  selectedAppointment.value = appointment
  detailDialog.value = true
}

const selectedDayFormatted = computed(() => {
  if (!selectedDay.value) return ''
  return formatDate(selectedDay.value.date)
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('es-ES', options)
}

const formatTimeAMPM = (time) => {
  if (!time || time === 'N/A') return time
  const [hours, minutes] = time.split(':')
  let hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12
  hour = hour ? hour : 12
  return `${hour}:${minutes} ${ampm}`
}

const getStatusColor = (estado) => {
  const colors = {
    'reservado': 'positive',
    'atendido': 'orange'
  }
  return colors[estado] || 'grey'
}

const getAppointmentClass = (estado) => {
  return estado === 'reservado' ? 'bg-positive' : 'bg-orange'
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.calendar-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.calendar-header {
  background-color: #f5f5f5;
  padding: 10px 0;
  border-bottom: 2px solid #e0e0e0;
}

.calendar-body {
  min-height: 500px;
}

.calendar-day {
  min-height: 120px;
  border: 1px solid #e0e0e0;
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #f9f9f9;
}

.calendar-day.other-month {
  background-color: #fafafa;
  color: #bdbdbd;
}

.calendar-day.today {
  background-color: #e3f2fd;
}

.day-header {
  font-weight: bold;
  margin-bottom: 5px;
  text-align: right;
  padding-right: 5px;
}

.appointments-list {
  overflow-y: auto;
  max-height: 100px;
}

.appointment-item {
  color: white;
  padding: 4px 6px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.appointment-item:hover {
  opacity: 0.8;
}

.appointment-time {
  font-weight: bold;
  font-size: 10px;
}

.appointment-client {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-procedure {
  font-size: 9px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-day-item:hover {
  background-color: #f5f5f5;
}

.day-appointments-card {
  max-width: 600px;
  width: 100%;
}

@media (max-width: 599px) {
  .day-appointments-card {
    max-width: 100%;
    width: 100vw;
    height: 100vh;
  }
}
</style>
