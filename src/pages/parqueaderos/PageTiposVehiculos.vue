<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Tipos de Vehículos </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="tipoVehiculos"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingC"
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
            <q-td key="id" :props="props">
              {{ props.row.id }}
            </q-td>
            <q-td key="icono" :props="props">
              <q-icon v-if="props.row.imagen" :name="props.row.imagen" color="primary" size="md" />
            </q-td>
            <q-td key="nombre" :props="props">
              {{ props.row.nombre }}
            </q-td>
            <q-td key="etiqueta_detalle" :props="props">
              {{ props.row.etiqueta_detalle }}
            </q-td>
            <q-td key="status" :props="props">
              <q-badge
                outline
                class="text-weight-bold"
                :color="props.row.status == 'Activo' ? 'green' : 'red'"
              >
                {{ props.row.status }}
              </q-badge>
            </q-td>            
            <q-td key="action" :props="props">
              <q-btn
                icon="unpublished"
                color="primary"
                @click.stop="desActivar(props.row)"
                v-if="laravelCan('admin.update')"
                title="Des/Activar"
                flat
                dense
              ></q-btn>              
              <q-btn
                icon="visibility"
                color="green"
                @click.stop="showViewModal(props.row)"
                v-if="laravelCan('admin.update')"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="edit"
                color="primary"
                @click.stop="showEditModal(props.row)"
                v-if="laravelCan('admin.update')"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                color="red"
                @click.stop="deleteItem(props.row.id)"
                v-if="laravelCan('admin.destroy')"
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
      v-if="laravelCan('admin.create')"
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
            <div class="col-md-12 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.nombre"
                :rules="[(val) => !!val || 'Campo requerido']"
                ref="nombre"
                label="Nombre"
                maxlength="191"
              >
              </q-input>
            </div>
            <div class="col-md-12 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.etiqueta_detalle"
                ref="etiqueta_detalle"
                label="Descripción"
                maxlength="200"
              >
              </q-input>
            </div>
            <div class="col-md-12 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.imagen"
                :options="iconosVehiculos"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="Icono del Vehículo"
              >
                <template v-slot:prepend>
                  <q-icon v-if="editedItem.imagen" :name="editedItem.imagen" color="primary" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.value" color="primary" size="md" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
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
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Detalle</span> Registro</q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Id:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.id }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Icono:</div></div>
            <div class="col-md-8">
              <q-icon v-if="showItem.imagen" :name="showItem.imagen" color="primary" size="lg" />
              <span v-else class="text-subtitle2 text-grey">Sin icono</span>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Descripción:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.nombre }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Etiqueta:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.etiqueta_detalle }}</div>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { laravelCan } from 'src/functions/function-general'
import { useTipoVehiculosStore } from 'src/stores/tipoVehiculos'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const tipoVehiculosStore = useTipoVehiculosStore()
const $q = useQuasar()
const router = useRouter()

const tipoVehiculos = computed(() => tipoVehiculosStore.tipoVehiculos)
const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const loadingC = ref(true)
const formRef = ref(null)
const nombre = ref(null)

const defaultItem = {
  id: '',
  nombre: '',
  imagen: '',
  etiqueta_detalle: '',
}

const showItem = ref({
  id: '',
  nombre: '',
  imagen: '',
  etiqueta_detalle: '',
})

const editedItem = ref({ ...defaultItem })

const filter = ref('')
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 7,
})

const iconosVehiculos = [
  { label: 'Bicicleta', value: 'pedal_bike' },
  { label: 'Bicicleta Eléctrica', value: 'electric_bike' },
  { label: 'Scooter Eléctrico', value: 'electric_scooter' },
  { label: 'Motocicleta', value: 'two_wheeler' },
  { label: 'Automóvil', value: 'directions_car' },
  { label: 'Auto Eléctrico', value: 'electric_car' },
  { label: 'Taxi', value: 'local_taxi' },
  { label: 'Bus', value: 'directions_bus' },
  { label: 'Shuttle', value: 'airport_shuttle' },
  { label: 'Camión', value: 'local_shipping' },
  { label: 'Montacargas', value: 'forklift' },
  { label: 'Carretilla', value: 'trolley' },
]

const columns = ref([
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'icono', align: 'center', label: 'Icono', sortable: false },
  { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'etiqueta_detalle', align: 'left', label: 'Etiqueta/Detalle', field: 'etiqueta_detalle', sortable: true },
  { name: 'status', align: 'left', label: 'Estado', field: 'status', sortable: false },  
  { name: 'action', align: 'center', label: 'Action' },
])

// methods
const desActivar = (item) => {
  const status = item.status == 'Activo' ? 'Desactivar' : 'Activar'
  let intStatus = item.status == 'Activo' ? 'Inactivo' : 'Activo'
  $q.dialog({
    title: 'Confirmar',
    message: 'Desea ' + status + ' registro?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // send request to server
    let user = {
      id: item.id,
      status: intStatus,
    }
    tipoVehiculosStore.desactivar(user)
  })
}

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

  if (editCreate.value) {
    tipoVehiculosStore.updateTipoVehiculo(editedItem.value)
  } else {
    tipoVehiculosStore.addTipoVehiculo(editedItem.value)
  }
  close()
}

const openDialog = () => {
  dialog.value = true
  setTimeout(() => {
    nextTick(() => {
      nombre.value.focus()
    })
  }, 200)
}

const showViewModal = (item) => {
  showItem.value = { ...item }
  setTimeout(() => {
    details.value = true
  }, 200)
}

const showEditModal = (item) => {
  // asigno al la variable del estado que contiene el id y nombre del role a editar
  editedItem.value = {
    id: item.id,
    nombre: item.nombre,
    imagen: item.imagen || '',
    etiqueta_detalle: item.etiqueta_detalle || '',
  }

  // variable que me dice si estoy editando o creando
  editCreate.value = true
  setTimeout(() => {
    dialog.value = true
  }, 200)
}

const deleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Realmente desea eliminar el item?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    tipoVehiculosStore.deleteTipoVehiculo(item)
  })
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))

// Cargar datos al montar el componente
onMounted(async () => {
  if (!laravelCan('admin.index')) {
    router.push({ path: '/dashboard' })
  } else {
    await tipoVehiculosStore.loadTipoVehiculos()
    loadingC.value = false
  }
})
</script>
<style lang="scss" scoped>
.my-page {
  width: 100%;
  max-width: 1000px;
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
