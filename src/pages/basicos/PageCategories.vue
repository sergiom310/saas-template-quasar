<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Categorias </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="categories"
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
            <q-td key="slug" :props="props">
              {{ props.row.slug }}
            </q-td>
            <q-td key="orden" :props="props">
              {{ props.row.orden }}
            </q-td>
            <q-td key="name2" :props="props">
              {{ props.row.name2 }}
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
        @click.stop="openDialog"
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
            <div class="col-md-5 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.name"
                :rules="[(val) => !!val || 'Campo requerido']"
                ref="name"
                label="Nombre Categoría"
                maxlength="191"
                @update:model-value="generateSlug"
              >
              </q-input>
            </div>
            <div class="col-md-5 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.slug"
                :rules="[(val) => !!val || 'Campo requerido']"
                ref="slug"
                label="Slug-Url"
                maxlength="191"
              >
              </q-input>
            </div>
            <div class="col-md-2 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.orden"
                :rules="[(val) => !!val || 'Campo requerido']"
                ref="orden"
                label="Orden"
              >
              </q-input>
            </div>
          </div>
          <div class="row q-px-md">
            <div class="col-md-5 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.name_en"
                ref="name"
                label="Nombre Categoría en Inglés"
                maxlength="191"
              >
              </q-input>
            </div>
          </div>
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.description"
              ref="description"
              label="Descripción"
              type="textarea"
              rows="4"
              class="col"
            >
            </q-input>
          </div>
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.description_en"
              ref="description"
              label="Descripción en Inglés"
              type="textarea"
              rows="4"
              class="col"
            >
            </q-input>
          </div>
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.icono"
              ref="icono"
              label="Icono (Material design)"
              class="col"
            >
            </q-input>
          </div>
          <div class="row q-ma-md">
            <q-select
              outlined
              clearable
              transition-show="jump-up"
              transition-hide="jump-up"
              v-model="selectCategories"
              :options="categories"
              option-value="id"
              option-label="name"
              ref="parent_id"
              label="Categoría Depende"
              class="col"
            >
            </q-select>
          </div>
          <div class="row q-ma-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <b>Imagen:</b> {{ editedItem.imagen ? editedItem.imagen.name : 'No seleccionado' }}
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <b>Banner:</b> {{ editedItem.banner ? editedItem.banner.name : 'No seleccionado' }}
            </div>
          </div>
          <div class="row q-pa-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-file
                outlined
                clearable
                v-model="editedItem.imagen"
                label="Icono de la Categoría"
                ref="imagen"
                class="col"
                @update:model-value="handleFileChange"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" class="primary" />
                </template>
              </q-file>
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-file
                outlined
                clearable
                v-model="editedItem.banner"
                label="Imagen encabezado de la Categoría"
                ref="banner"
                class="col"
                accept="image/*"
                @update:model-value="handleFileChange2"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" class="primary" />
                </template>
              </q-file>
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
      <q-card style="width: 980px; max-width: 1000px">
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
            <div class="col-md-4"><div class="text-subtitle1">Nombre Categoría:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.name }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Nombre Categoría Inglés:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.name_en }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Url:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.slug }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Descripción:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2" v-html="showItem.value.description"></div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Descripción Inglés:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2" v-html="showItem.value.description_en"></div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Orden:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.orden }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Categoría Raíz:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.name2 }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Icono Categoría:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.value.icono }}</div>
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
            <div class="col-md-4"><div class="text-subtitle1">Imagen de la Categoría</div></div>
            <div class="col-md-8">
              <q-img
                v-if="showItem.value.imagen"
                :src="urlRepo + showItem.value.imagen"
                basic
                style="height: auto; max-width: 90px"
              />
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col-md-4">
              <div class="text-subtitle1">Imagen Encabezado de la Categoría</div>
            </div>
            <div class="col-md-8">
              <q-img v-if="showItem.value.banner" :src="urlRepo + showItem.value.banner" basic>
                <q-icon
                  class="absolute all-pointer-events cursor-pointer"
                  size="28px"
                  name="delete"
                  title="Eliminar"
                  style="top: 8px; right: 8px"
                  @click.stop="deleteImagen(showItem.value.id)"
                />
              </q-img>
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
import { useCategoryStore } from 'src/stores/category'
import { useQuasar, QFile, date } from 'quasar'
import { useRouter } from 'vue-router'

const categoryStore = useCategoryStore()
const $q = useQuasar()
const router = useRouter()

const categories = computed(() => categoryStore.categories)
const urlRepo = `${import.meta.env.VITE_API_URL}/`
const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const selectCategories = ref({ id: '', name: '' })
const loadingC = ref(true)
const formRef = ref(null)

const defaultItem = {
  id: '',
  parent_id: '',
  name: '',
  description: '',
  name_en: '',
  description_en: '',
  slug: '',
  orden: '',
  icono: '',
  imagen: null,
  banner: null,
}

const showItem = {
  id: '',
  name: '',
  name2: '',
  slug: '',
  orden: '',
  icono: '',
  description: '',
  name_en: '',
  description_en: '',
  imagen: null,
  banner: null,
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

const columns = ref([
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  { name: 'slug', align: 'left', label: 'Url', field: 'slug', sortable: true },
  { name: 'orden', align: 'left', label: 'orden', field: 'orden', sortable: true },
  { name: 'name2', align: 'left', label: 'Categoría Raiz', field: 'name2', sortable: true },
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

const handleFileChange = (file) => {
  editedItem.value.imagenFile = file || null;  
}
const handleFileChange2 = (file) => {
  editedItem.value.bannerFile = file || null;  
}

const generateSlug = () => {
  editedItem.value.slug = editedItem.value.name
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .trim()
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    // eslint-disable-next-line no-useless-escape
    .replace(/[^\w\-]+/g, '') // Elimina caracteres especiales excepto guiones
}

const deleteImagen = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Realmente desea eliminar la imagen?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    categoryStore.deleteImage(id)
    setTimeout(() => (details.value = false), 500)
  })
}

const openDialog = () => {
  selectCategories.value = { id: '', name: '' }
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const desActivar = (item) => {
  const status = item.status == 'Activo' ? 'Desactivar' : 'Activar'
  let intStatus = item.status == 'Activo' ? 'Inactivo' : 'Activo'
  $q.dialog({
    title: 'Confirmar',
    message: 'Desea ' + status + ' la categoría?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // send request to server
    let user = {
      id: item.id,
      status: intStatus,
    }
    categoryStore.desactivar(user)
  })
}

const close = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    selectCategories.value = { id: '', name: '' }
    editCreate.value = false
  }, 200)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  editedItem.value.parent_id =
    selectCategories.value?.id !== undefined && selectCategories.value?.id !== null ? selectCategories.value.id : ''

  if (editCreate.value) {
    categoryStore.updateCategory(editedItem.value)
  } else {
    categoryStore.addCategory(editedItem.value)
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
    parent_id: item.parent_id,
    name: item.name,
    description: item.description,
    name_en: item.name_en,
    description_en: item.description_en,
    orden: item.orden,
    slug: item.slug,
    icono: item.icono,
    imagen: null,
    banner: null,
  }
  if (item.parent_id !== null) {
    selectCategories.value = { id: item.parent_id, name: item.name2 }
  } else {
    setTimeout(() => {
      selectCategories.value = { id: '', name: '' }
    }, 100)
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
    categoryStore.deleteCategory(item)
  })
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))

// Cargar datos al montar el componente
onMounted(async () => {
  if (!laravelCan('admin.index')) {
    router.push({ path: '/dashboard' })
  } else {
    await categoryStore.loadCategory()
    selectCategories.value = categoryStore.categories
    loadingC.value = false
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
