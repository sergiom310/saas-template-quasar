<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Especialidades </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="especialidades"
        :columns="columns"
        row-key="id_especialidad"
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
            <q-td key="id_especialidad" :props="props">
              {{ props.row.id_especialidad }}
            </q-td>
            <q-td key="nombre" :props="props">
              {{ props.row.nombre }}
            </q-td>
            <q-td key="descripcion" :props="props">
              {{ props.row.descripcion }}
            </q-td>
            <q-td key="activo" :props="props">
              <q-badge
                outline
                class="text-weight-bold"
                :color="props.row.activo == 1 ? 'green' : 'red'"
              >
                {{ props.row.activo == 1 ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </q-td>
            <q-td key="action" :props="props">
              <q-btn
                icon="unpublished"
                color="primary"
                @click.stop="desActivar(props.row)"
                title="Des/Activar"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="visibility"
                color="green"
                @click.stop="showViewModal(props.row)"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="edit"
                color="primary"
                @click.stop="showEditModal(props.row)"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                color="red"
                @click.stop="deleteItem(props.row.id_especialidad)"
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
          <div class="row q-px-md">
            <div class="col-md-12 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.nombre"
                :rules="[(val) => !!val || 'Campo requerido']"
                ref="nombre"
                label="Nombre"
                maxlength="100"
              >
              </q-input>
            </div>
            <div class="col-md-12 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.descripcion"
                label="Descripción"
                maxlength="255"
              >
              </q-input>
            </div>
            <div class="col-md-12 col-xs-12">
              <q-toggle
                v-model="editedItem.activo"
                :true-value="1"
                :false-value="0"
                label="Activo"
                color="green"
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
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Detalle</span> Registro</q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Id:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.id_especialidad }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Nombre:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.nombre }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Descripción:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.descripcion }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4"><div class="text-subtitle1">Estado:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.activo == 1 ? 'Activo' : 'Inactivo' }}</div>
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
import { useEspecialidadesStore } from 'src/stores/especialidades'
import { useQuasar } from 'quasar'
const especialidadesStore = useEspecialidadesStore()
const $q = useQuasar()

const especialidades = computed(() => especialidadesStore.especialidades)
const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const loadingC = ref(true)
const formRef = ref(null)
const nombre = ref(null)

const defaultItem = {
  id_especialidad: null,
  nombre: '',
  descripcion: '',
  activo: 1
}

const showItem = ref({ ...defaultItem })

const editedItem = ref({ ...defaultItem })

const filter = ref('')
const pagination = ref({
  sortBy: 'id_especialidad',
  descending: false,
  page: 1,
  rowsPerPage: 7,
})

const columns = ref([
  { name: 'id_especialidad', align: 'left', label: 'ID', field: 'id_especialidad', sortable: true },
  { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion', sortable: false },
  { name: 'activo', align: 'center', label: 'Estado', field: 'activo', sortable: false },
  { name: 'action', align: 'center', label: 'Acciones' },
])

// methods
const desActivar = (item) => {
  const activo = item.activo == 1 ? 0 : 1
  const texto = item.activo == 1 ? 'Desactivar' : 'Activar'
  $q.dialog({
    title: 'Confirmar',
    message: '¿Desea ' + texto + ' el registro?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    let payload = {
      id_especialidad: item.id_especialidad,
      activo: activo,
    }
    especialidadesStore.desactivar(payload)
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
    especialidadesStore.updateEspecialidad(editedItem.value)
  } else {
    especialidadesStore.addEspecialidad(editedItem.value)
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
  editedItem.value = {
    id_especialidad: item.id_especialidad,
    nombre: item.nombre,
    descripcion: item.descripcion,
    activo: item.activo,
  }

  editCreate.value = true
  setTimeout(() => {
    dialog.value = true
  }, 200)
}

const deleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Realmente desea eliminar el registro?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    especialidadesStore.deleteEspecialidad(item)
  })
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))

// Cargar datos al montar el componente
onMounted(async () => {
  await especialidadesStore.loadEspecialidades()
  loadingC.value = false
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
