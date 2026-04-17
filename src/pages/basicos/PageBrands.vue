<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Marcas </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="brands"
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
            <q-td key="name" :props="props">
              {{ props.row.name }}
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
            <q-td key="created_at" :props="props">
              {{ formatDate(props.row.created_at, 'DD-MMM-YYYY') }}
            </q-td>
            <q-td key="action" :props="props">
              <q-btn
                icon="unpublished"
                color="primary"
                @click.stop="desActivar(props.row)"
                v-if="laravelCan('system.update')"
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
        @click.stop="dialog = true"
        round
        class="all-pointer-events"
        color="primary"
        size="18px"
        icon="add"
      />
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 880px; max-width: 980px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-px-md">
            <div class="col-md-12 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.name"
                :rules="[(val) => !!val || 'Field is required']"
                ref="name"
                label="Nombre de la marca"
                maxlength="191"
              >
              </q-input>
            </div>
          </div>
          <div class="row q-ma-md">
            <div class="col-md-12 col-xs-12 q-px-xs">
              <b>Imagen:</b> {{ editedItem.imagen ? editedItem.imagen.name : 'No seleccionado' }}
            </div>
          </div>
          <div class="row q-pa-md">
            <div class="col-md-12 col-xs-12 q-px-xs">
              <q-file
                outlined
                clearable
                accept="image/*"
                v-model="editedItem.imagen"
                label="Imagen de la marca"
                ref="imagen"
                class="col"
                @update:model-value="handleFileChange"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" class="primary" />
                </template>
              </q-file>
            </div>
          </div>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="close"></q-btn>
            <q-btn flat label="Guardar" color="primary" type="submit"></q-btn>
          </q-card-actions>
        </q-form>

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
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Id:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.id }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Nombre Marca:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.name }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Creado el:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatDate(showItem.value.created_at) }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Última actualización:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatDate(showItem.value.updated_at) }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col-md-4"><div class="text-subtitle1">Imagen de la Marca</div></div>
            <div class="col-md-8">
              <q-img
                v-if="showItem.value.imagen"
                :src="urlRepo + showItem.value.imagen"
                basic
                style="height: auto; max-width: 225px"
              />
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
import { laravelCan, formatDate } from 'src/functions/function-general'
import { useBrandsStore } from 'src/stores/brands'
import { useQuasar, QFile, date } from 'quasar'
import { useRouter } from 'vue-router'

const brandStore = useBrandsStore()
const $q = useQuasar()
const router = useRouter()

const brands = computed(() => brandStore.brands)
const urlRepo = `${import.meta.env.VITE_API_URL}/`
const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const loadingC = ref(true)
const formRef = ref(null)

const defaultItem = {
  id: '',
  name: '',
  imagen: null,
}

const showItem = {
  id: '',
  name: '',
  imagen: null,
  created_at: '',
  updated_at: '',
}

const editedItem = ref({ ...defaultItem })

const filter = ref('')
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 7,
})

const handleFileChange = (file) => {
  editedItem.value.photoFile = file || null;  
}

const columns = ref([
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  { name: 'status', align: 'left', label: 'Estado', field: 'status', sortable: false },
  {
    name: 'created_at',
    align: 'left',
    label: 'Creado el',
    field: 'created_at',
    sortable: true,
    format: (val) => date.formatDate(val, 'DD-MM-YYYY'),
  },
  { name: 'action', align: 'center', label: 'Action' },
])

// methods

const desActivar = (item) => {
  const status = item.status == 'Activo' ? 'Desactivar' : 'Activar'
  let intStatus = item.status == 'Activo' ? 'Inactivo' : 'Activo'
  $q.dialog({
    title: 'Confirmar',
    message: 'Desea ' + status + ' la marca?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // send request to server
    let user = {
      id: item.id,
      status: intStatus,
    }
    brandStore.desactivar(user)
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
    brandStore.updateBrand(editedItem.value)
  } else {
    brandStore.addBrand(editedItem.value)
  }
  close()
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
    name: item.name,
    imagen: null,
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
    brandStore.deleteBrand(item)
  })
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))

// Cargar datos al montar el componente
onMounted(async () => {
  if (!laravelCan('admin.index')) {
    router.push({ path: '/dashboard' })
  } else {
    await brandStore.loadBrands()
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
