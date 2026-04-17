<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="payment" />
      <q-toolbar-title> Pagos </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="pagos"
        :columns="columns"
        row-key="id_pago"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingP"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
            <template v-slot:append>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id_pago" :props="props">
              {{ props.row.id_pago }}
            </q-td>
            <q-td key="cod_cli" :props="props">
              {{ props.row.cod_cli }}
            </q-td>
            <q-td key="nom_cli" :props="props">
              {{ props.row.cliente?.nom_cli }}
            </q-td>
            <q-td key="val_pag" :props="props" >
              ${{ new Intl.NumberFormat('es-CO').format(props.row.val_pag) }}
            </q-td>
            <q-td key="fecha_pag" :props="props">
              {{ formatFecha(props.row.fecha_pag) }}
            </q-td>
            <q-td key="forma_pago" :props="props">
              {{ props.row.metodo_pago?.detalle }}
            </q-td>
            <q-td key="desde" :props="props">
              {{ formatFecha(props.row.desde) }}
            </q-td>
            <q-td key="hasta" :props="props">
              {{ formatFecha(props.row.hasta) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <div
      class="absolute-bottom text-center q-mb-lg no-pointer-events"
      v-if="laravelCan('admin.create') || laravelCan('system.create')"
    >
      <q-btn
        @click.stop="openDialog"
        round
        class="all-pointer-events"
        color="primary"
        size="18px"
        icon="add"
      />
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 680px; max-width: 780px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-px-md q-col-gutter-sm">
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.cod_cli"
                :options="clientesOptions"
                option-value="cod_cli"
                option-label="nom_cli"
                emit-value
                map-options
                label="Cliente"
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.val_pag"
                type="number"
                label="Monto"
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.fecha_pag"
                type="date"
                label="Fecha del Pago"
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.cod_forp"
                :options="metodosPagoOptions"
                option-value="id"
                option-label="detalle"
                emit-value
                map-options
                label="Forma de Pago"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.desde"
                type="date"
                label="Válido Desde"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.hasta"
                type="date"
                label="Válido Hasta"
              />
            </div>
          </div>
        </q-form>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="close"></q-btn>
          <q-btn flat label="Guardar" color="primary" @click="save"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="details" class="q-pa-md q-gutter-sm">
      <q-card style="width: 760px; max-width: 800px">
        <q-toolbar>
          <q-avatar>
            <q-icon name="payment" size="md" />
          </q-avatar>

          <q-toolbar-title
            ><span class="text-weight-bold">Detalle</span> Pago</q-toolbar-title
          >

          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">ID Pago:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.id_pago }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Cliente:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.cliente?.nom_cli }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Monto:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2"> ${{ new Intl.NumberFormat('es-CO').format(showItem.val_pag) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Fecha Pago:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatFecha(showItem.fecha_pag) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Forma de Pago:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.metodo_pago?.detalle }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Válido Desde:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatFecha(showItem.desde) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Válido Hasta:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatFecha(showItem.hasta) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Usuario Sistema:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.user_sys }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Cerrar"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { laravelCan } from 'src/functions/function-general'
import { usePagosStore } from 'src/stores/pagos'
import { useClientesStore } from 'src/stores/clientes'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const pagosStore = usePagosStore()
const clientesStore = useClientesStore()
const $q = useQuasar()

const pagos = computed(() => pagosStore.pagos)
const clientesOptions = computed(() => clientesStore.clientes)

const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const loadingP = ref(true)
const formRef = ref(null)
const metodosPagoOptions = ref([])

const formatFecha = (fecha) => {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('T')[0].split('-')
  return `${dia}-${mes}-${anio}`
}

const defaultItem = {
  id_pago: '',
  cod_cli: '',
  val_pag: null,
  fecha_pag: new Date().toISOString().split('T')[0],
  cod_forp: null,
  desde: null,
  hasta: null,
  user_sys: '',
}

const showItem = ref({ ...defaultItem })
const editedItem = ref({ ...defaultItem })

const filter = ref('')
const pagination = ref({
  sortBy: 'id_pago',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

const columns = ref([
  { name: 'id_pago', align: 'left', label: 'ID', field: 'id_pago', sortable: true },
  { name: 'cod_cli', align: 'left', label: 'Código Cliente', field: 'cod_cli', sortable: true },
  { name: 'nom_cli', align: 'left', label: 'Cliente', field: row => row.cliente?.nom_cli, sortable: true },
  { name: 'val_pag', align: 'left', label: 'Monto', field: 'val_pag', sortable: true },
  { name: 'fecha_pag', align: 'left', label: 'Fecha Pago', field: 'fecha_pag', sortable: true },
  { name: 'forma_pago', align: 'left', label: 'Forma Pago', field: row => row.metodo_pago?.detalle, sortable: true },
  { name: 'desde', align: 'left', label: 'Desde', field: 'desde', sortable: true },
  { name: 'hasta', align: 'left', label: 'Hasta', field: 'hasta', sortable: true },
])

// methods
const close = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editCreate.value = false
  }, 200)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  try {
    // Preparar datos
    const pagoData = {
      ...editedItem.value,
      val_pag: editedItem.value.val_pag ? parseFloat(editedItem.value.val_pag) : null,
      desde: editedItem.value.desde || null,
      hasta: editedItem.value.hasta || null,
    }

    if (editCreate.value) {
      await pagosStore.updatePago(pagoData)
    } else {
      await pagosStore.addPago(pagoData)
    }

    $q.notify({
      type: 'positive',
      message: editCreate.value ? 'Pago actualizado' : 'Pago guardado',
    })
    close()
  } catch (error) {
    console.error('Error al guardar pago:', error)
    $q.notify({
      type: 'negative',
      message: 'Error: ' + (error.response?.data?.error || error.message),
    })
  }
}

const openDialog = () => {
  dialog.value = true
}

// funciones de acciones eliminadas: showViewModal, showEditModal, deleteItem

const formTitle = computed(() => (editCreate.value ? 'Editar Pago' : 'Nuevo Pago'))

// Cargar métodos de pago
const loadMetodosPago = async () => {
  try {
    const response = await api.get('/api/metodos-pago')
    metodosPagoOptions.value = response.data
  } catch (error) {
    console.error('Error al cargar métodos de pago:', error)
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    await Promise.all([
      pagosStore.loadPagos(),
      clientesStore.loadClientes(),
      loadMetodosPago(),
    ])
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loadingP.value = false
  }
})
</script>

<style lang="scss" scoped>
.my-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.text-subtitle1 {
  font-weight: 600;
}
.q-gutter-sm > * {
  margin-top: 0;
  margin-left: 0;
}
</style>
