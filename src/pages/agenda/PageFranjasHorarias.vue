<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="schedule" />
      <q-toolbar-title> Franjas Horarias </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="franjas"
        :columns="columns"
        row-key="id_franja"
        :filter="filter"
        v-model:pagination="pagination"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id_franja" :props="props">
              {{ props.row.id_franja }}
            </q-td>
            <q-td key="hora_inicio" :props="props">
              {{ formatTime12h(props.row.hora_inicio) }}
            </q-td>
            <q-td key="hora_fin" :props="props">
              {{ formatTime12h(props.row.hora_fin) }}
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn
                icon="edit"
                color="primary"
                @click.stop="editItem(props.row)"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                color="red"
                @click.stop="deleteItem(props.row.id_franja)"
                flat
                dense
              ></q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <div
      class="absolute-bottom text-center q-mb-lg no-pointer-events"
    >
      <q-btn
        @click.stop="openGenerateDialog"
        round
        class="all-pointer-events q-mr-sm"
        color="secondary"
        size="18px"
        icon="auto_awesome"
      >
        <q-tooltip>Generar Franjas Automáticamente</q-tooltip>
      </q-btn>
      <q-btn
        @click.stop="openDialog"
        round
        class="all-pointer-events"
        color="primary"
        size="18px"
        icon="add"
      >
        <q-tooltip>Agregar Franja Individual</q-tooltip>
      </q-btn>
    </div>

    <!-- Diálogo para generar franjas automáticamente -->
    <q-dialog v-model="dialogGenerate" persistent>
      <q-card style="width: 680px; max-width: 780px">
        <q-card-section class="row items-center">
          <q-icon name="auto_awesome" size="sm" class="q-mr-sm" color="secondary" />
          <span class="q-ml-sm text-h6">Generar Franjas Automáticamente</span>
        </q-card-section>

        <q-form ref="formGenerateRef" @submit.prevent="generateFranjas">
          <div class="row q-px-md">
            <div class="col-12 q-px-sm q-mb-md">
              <div class="text-caption text-grey-7">
                Configure el rango de horas y el intervalo para generar automáticamente las franjas horarias.
              </div>
            </div>

            <div class="col-md-4 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="generateForm.hora_inicio"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Hora Inicial"
                hint="Seleccione la hora inicial"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="generateForm.hora_inicio" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-md-4 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="generateForm.hora_fin"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Hora Final"
                hint="Seleccione la hora final"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="generateForm.hora_fin" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-md-4 col-xs-12 q-px-sm">
              <q-select
                outlined
                v-model="generateForm.intervalo"
                :options="intervaloOptions"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Intervalo (minutos)"
                emit-value
                map-options
              />
            </div>

            <div class="col-12 q-px-sm q-mt-md" v-if="previewFranjas.length > 0">
              <q-banner class="bg-blue-1 text-primary">
                <template v-slot:avatar>
                  <q-icon name="info" color="primary" />
                </template>
                Se generarán <strong>{{ previewFranjas.length }}</strong> franjas horarias
              </q-banner>
            </div>
          </div>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="closeGenerateDialog" />
            <q-btn flat label="Generar" color="secondary" type="submit" icon="auto_awesome" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 680px; max-width: 780px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-px-md">
            <div class="col-md-6 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.hora_inicio"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Hora Inicio"
                hint="Seleccione la hora de inicio"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="editedItem.hora_inicio" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.hora_fin"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Hora Fin"
                hint="Seleccione la hora final"
                readonly
              >
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="editedItem.hora_fin" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="close" />
            <q-btn flat label="Guardar" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogDelete" persistent>
      <q-card>
        <q-card-section>
          <span class="q-ml-sm">¿Está seguro de eliminar este registro?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="closeDelete" />
          <q-btn flat label="Eliminar" color="red" @click="deleteItemConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFranjasHorariasStore } from 'src/stores/franjasHorarias'

const franjasStore = useFranjasHorariasStore()

const franjas = computed(() => franjasStore.franjas)
const dialog = ref(false)
const formRef = ref(null)
const dialogDelete = ref(false)
const filter = ref('')

// Estado para generación automática
const dialogGenerate = ref(false)
const formGenerateRef = ref(null)
const generateForm = ref({
  hora_inicio: '08:00',
  hora_fin: '19:00',
  intervalo: 30
})

const intervaloOptions = [
  { label: '15 minutos', value: 15 },
  { label: '30 minutos', value: 30 },
  { label: '45 minutos', value: 45 },
  { label: '60 minutos (1 hora)', value: 60 },
  { label: '90 minutos (1.5 horas)', value: 90 },
  { label: '120 minutos (2 horas)', value: 120 }
]

const previewFranjas = ref([])

// Función para convertir formato 24h HH:MM a minutos desde medianoche
const convertToMinutes = (time24h) => {
  if (!time24h) return 0
  
  const [hoursStr, minutesStr] = time24h.split(':')
  const hours = parseInt(hoursStr)
  const minutes = parseInt(minutesStr)
  
  return hours * 60 + minutes
}

// Función para convertir minutos desde medianoche a formato 24h HH:MM
const convertFromMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// Función para calcular las franjas que se generarán
const calculatePreviewFranjas = () => {
  if (!generateForm.value.hora_inicio || !generateForm.value.hora_fin || !generateForm.value.intervalo) {
    previewFranjas.value = []
    return
  }

  const franjas = []
  const inicioMinutos = convertToMinutes(generateForm.value.hora_inicio)
  const finMinutos = convertToMinutes(generateForm.value.hora_fin)
  const intervalo = generateForm.value.intervalo

  let currentMinutos = inicioMinutos

  while (currentMinutos + intervalo <= finMinutos) {
    const horaInicio = convertFromMinutes(currentMinutos)
    const horaFin = convertFromMinutes(currentMinutos + intervalo)

    franjas.push({
      hora_inicio: horaInicio,
      hora_fin: horaFin
    })

    currentMinutos += intervalo
  }

  previewFranjas.value = franjas
}

// Watch para recalcular el preview cuando cambien los valores
watch(() => [generateForm.value.hora_inicio, generateForm.value.hora_fin, generateForm.value.intervalo], () => {
  calculatePreviewFranjas()
}, { deep: true })

// Función para formatear hora de 24h a 12h con AM/PM
const formatTime12h = (time) => {
  if (!time) return ''
  
  // Extraer horas y minutos (ignorar segundos)
  const [hoursStr, minutesStr] = time.split(':')
  let hours = parseInt(hoursStr)
  const minutes = parseInt(minutesStr)
  
  // Determinar AM/PM
  const period = hours >= 12 ? 'PM' : 'AM'
  
  // Convertir a formato 12 horas
  if (hours === 0) {
    hours = 12 // Medianoche
  } else if (hours > 12) {
    hours = hours - 12
  }
  
  // Formatear con minutos
  const minutesFormatted = minutes.toString().padStart(2, '0')
  
  return `${hours}:${minutesFormatted} ${period}`
}

const pagination = ref({
  sortBy: 'hora_inicio',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const columns = [
  {
    name: 'id_franja',
    required: true,
    label: 'ID',
    align: 'left',
    field: row => row.id_franja,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'hora_inicio',
    align: 'center',
    label: 'Hora Inicio',
    field: 'hora_inicio',
    format: val => formatTime12h(val),
    sortable: true
  },
  {
    name: 'hora_fin',
    align: 'center',
    label: 'Hora Fin',
    field: 'hora_fin',
    format: val => formatTime12h(val),
    sortable: true
  },
  { name: 'actions', align: 'center', label: 'Acciones', field: '', sortable: false }
]

const defaultItem = {
  id_franja: 0,
  hora_inicio: '',
  hora_fin: ''
}

const editedIndex = ref(-1)
const editedItem = ref({ ...defaultItem })

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nueva Franja Horaria' : 'Editar Franja Horaria'
})

const editItem = (item) => {
  editedIndex.value = franjas.value.indexOf(item)
  // Las horas ya están en formato 24h HH:MM:SS, solo extraemos HH:MM
  editedItem.value = {
    ...item,
    hora_inicio: item.hora_inicio.substring(0, 5), // Extrae HH:MM de HH:MM:SS
    hora_fin: item.hora_fin.substring(0, 5)
  }
  dialog.value = true
}

const deleteItem = (id) => {
  editedItem.value.id_franja = id
  dialogDelete.value = true
}

const deleteItemConfirm = async () => {
  await franjasStore.deleteFranja(editedItem.value.id_franja)
  closeDelete()
}

const close = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  }, 300)
}

const closeDelete = () => {
  dialogDelete.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  }, 300)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  // Las horas ya están en formato 24h correcto (HH:MM)
  if (editedIndex.value > -1) {
    await franjasStore.updateFranja(editedItem.value)
  } else {
    await franjasStore.addFranja(editedItem.value)
  }
  close()
}

const openDialog = () => {
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
  dialog.value = true
}

const openGenerateDialog = () => {
  generateForm.value = {
    hora_inicio: '08:00',
    hora_fin: '19:00',
    intervalo: 30
  }
  previewFranjas.value = []
  dialogGenerate.value = true
  calculatePreviewFranjas()
}

const closeGenerateDialog = () => {
  dialogGenerate.value = false
  setTimeout(() => {
    generateForm.value = {
      hora_inicio: '08:00',
      hora_fin: '19:00',
      intervalo: 30
    }
    previewFranjas.value = []
  }, 300)
}

const generateFranjas = async () => {
  const isValid = await formGenerateRef.value.validate()
  if (!isValid) {
    return
  }

  if (previewFranjas.value.length === 0) {
    return
  }

  // Guardar todas las franjas generadas
  await franjasStore.addMultipleFranjas(previewFranjas.value)
  closeGenerateDialog()
}

onMounted(async () => {
  await franjasStore.loadFranjas()
})
</script>

<style scoped>
/* Asegurar que los headers de time pickers siempre sean visibles */
:deep(.q-time__header) {
  opacity: 1 !important;
  visibility: visible !important;
}

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
