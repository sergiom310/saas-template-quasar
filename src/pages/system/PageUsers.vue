<template>
  <q-page padding>
    <q-toolbar class="toolbar-header">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Users </q-toolbar-title>
      <q-btn v-if="canAccess('system.create')" color="secondary" icon="add" label="Incluir" @click.stop="dialog = true" />
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="users"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingPe"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
            <template v-slot:append>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-action="cellProperties">
          <q-td :props="cellProperties">
            <q-btn
              icon="how_to_reg"
              @click.stop="desActivar(cellProperties.row)"
              v-if="canAccess('system.update')"
              flat
              dense
            ></q-btn>
            <q-btn
              icon="edit"
              color="positive"
              @click.stop="showEditRoleModal(cellProperties.row)"
              v-if="canAccess('system.update')"
              flat
              dense
            ></q-btn>
            <q-btn
              icon="delete"
              color="red"
              @click.stop="deleteItem(cellProperties.row.id)"
              v-if="canAccess('system.destroy')"
              flat
              dense
            ></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 480px; max-width: 580px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.name"
              :rules="[(val) => !!val || 'Campo requerido']"
              label="Nombre"
              class="col"
            >
            </q-input>
          </div>
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.email"
              :rules="[(val) => isValidEmailAddress(val) || 'Favor ingrese un email válido.']"
              label="Email"
              class="col"
            >
            </q-input>
          </div>
          <div class="row q-ma-md">
            <q-select
              outlined
              v-model="selectTipoDoc"
              :options="tiposdoc"
              :rules="[(val) => !!val || 'Campo requerido']"
              ref="tipo_documento"
              label="Tipo Documento"
              emit-value
              class="col"
              lazy-rules
            />
          </div>
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.documento"
              :rules="[(val) => !!val || 'Campo requerido']"
              label="No. Documento"
              class="col"
              lazy-rules
            >
            </q-input>
          </div>
          <div class="row q-ma-md">
            <q-select
              outlined
              label="Rol de Usuario"
              class="col"
              v-model="selectRoles"
              :options="roles"
              :rules="[(val) => (val && val.length > 0) || 'Campo requerido']"
              use-chips
              multiple
              option-value="id"
              option-label="name"
              lazy-rules
              ref="rolesSelect"
            ></q-select>
          </div>
          <div class="row q-ma-md" v-if="!editCreate.value">
            <q-input
              outlined
              v-model="editedItem.password"
              :rules="[
                (val) => val?.length > 0 || 'Campo requerido.',
                (val) => val?.length >= 8 || 'Ingrese al menos 8 caracteres.',
              ]"
              lazy-rules
              :type="show1 ? 'password' : 'text'"
              class="col"
              label="Password"
              stack-label
              :key="'password-create'"
            >
              <template v-slot:append>
                <q-icon
                  :name="show1 ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="show1 = !show1"
                />
              </template>
            </q-input>
          </div>
          <div class="row q-ma-md" v-else>
            <q-input
              outlined
              v-model="editedItem.password"
              :rules="[]"
              lazy-rules
              :type="show1 ? 'password' : 'text'"
              class="col"
              label="Password (opcional para edición)"
              stack-label
              hint="Déjelo vacío para mantener la contraseña actual"
              :key="'password-edit'"
            >
              <template v-slot:append>
                <q-icon
                  :name="show1 ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="show1 = !show1"
                />
              </template>
            </q-input>
          </div>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar"  @click="close"></q-btn>
            <q-btn flat label="Guardar"  @click="save" type="button"></q-btn>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'
import { laravelCan } from 'src/functions/function-general'
import { useUsersStore } from 'src/stores/users'
import { useRolesStore } from 'src/stores/roles'

const $q = useQuasar()
const router = useRouter()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()

const users = computed(() => usersStore.users)
const roles = computed(() => {
  // Si el usuario actual tiene permiso admin.index, ocultar el rol con id=1
  if (laravelCan('admin.index')) {
    return rolesStore.roles.filter(r => r.id !== 1)
  }
  return rolesStore.roles
})

// Estados reactivos
const show1 = ref(true)
const dialog = ref(false)
const editCreate = ref(false)
const loadingPe = ref(true)
const formRef = ref(null)

const defaultItem = {
  id: '',
  name: '',
  email: '',
  tipo_documento: '',
  documento: '',
  password: '',
  role_id: '',
}

const editedItem = ref({ ...defaultItem })
const selectTipoDoc = ref('')
const selectRoles = ref([])

const tiposdoc = [
  { value: 'Nit', label: 'Nit' },
  { value: 'Cédula', label: 'Cédula' },
  { value: 'Cédula de extranjería', label: 'Cédula de extranjería' },
  { value: 'Pasaporte', label: 'Pasaporte' },
]

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
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'is_active', align: 'left', label: 'Estado', field: 'is_active', sortable: true, format: (val) => (val === 1 ? 'Activo' : 'Inactivo') },
  {
    name: 'created_at',
    align: 'center',
    label: 'Creado en',
    field: 'created_at',
    sortable: true,
    format: (val) => date.formatDate(val, 'YYYY-MM-DD'),
  },
  { name: 'action', align: 'center', label: 'Action' },
])

// Métodos
const isValidEmailAddress = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

const save = async () => {
  try {
    // En modo edición, validamos manualmente los campos requeridos
    if (editCreate.value) {
      // Verificar campos requeridos (excepto password)
      if (!editedItem.value.name || !editedItem.value.email || !isValidEmailAddress(editedItem.value.email) ||
          !selectTipoDoc.value || !editedItem.value.documento ||
          !(selectRoles.value && selectRoles.value.length > 0)) {
        showErrorMessage('Todos los campos obligatorios deben estar completos');
        return;
      }
    } else {
      // En modo creación, usamos el validador automático
      if (formRef.value) {
        const isValid = await formRef.value.validate();
        if (!isValid) return;
      }
    }

    // Verificaciones adicionales (con showErrorMessage para casos no cubiertos por rules)
    if (!(selectRoles.value && selectRoles.value.length > 0)) {
      showErrorMessage('Debe seleccionar al menos un rol de usuario');
      return;
    }

    // Preparar los datos correctamente
    const userData = { ...editedItem.value };

    // Asignar el tipo de documento
    userData.tipo_documento = selectTipoDoc.value;

    // Manejar los roles de manera consistente
    if (selectRoles.value && selectRoles.value.length > 0) {
      // Verificar si cada elemento de selectRoles es un objeto o un ID
      if (typeof selectRoles.value[0] === 'object') {
        userData.role_id = selectRoles.value.map(role => role.id);
      } else {
        userData.role_id = selectRoles.value;
      }
    }

    // Si estamos en modo edición y la contraseña está vacía, eliminarla del objeto
    // para que el backend no la actualice
    if (editCreate.value && (!userData.password || userData.password.trim() === '')) {
      delete userData.password;
    }
    // Enviar datos al API
    if (editCreate.value) {
      await usersStore.updateUser(userData);
    } else {
      await usersStore.addUser(userData);
    }
    close();
  } catch (error) {
    console.error('Error en el guardado:', error);
    showErrorMessage('Ha ocurrido un error al guardar el usuario');
  }
}

const showEditRoleModal = (item) => {
  editedItem.value = { ...item }

  // Asegurarnos de asignar el tipo de documento correctamente
  selectTipoDoc.value = item.tipo_documento

  // Manejar la asignación de roles correctamente
  if (item.roles && Array.isArray(item.roles)) {
    // Los roles ya son objetos completos, asignarlos directamente
    selectRoles.value = item.roles
  } else if (item.role_id && Array.isArray(item.role_id)) {
    // Si tenemos role_id como array de IDs, debemos convertirlos a objetos
    selectRoles.value = item.role_id.map(id => {
      // Buscar el rol completo basado en el ID
      const role = roles.value.find(r => r.id === id)
      return role || { id: id, name: `Rol ${id}` }
    })
  } else {
    selectRoles.value = []
  }

  editCreate.value = true

  setTimeout(() => {
    dialog.value = true
  }, 200)
}

const deleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Realmente desea eliminar el item?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Eliminar', flat: true, color: 'negative' },
    persistent: true,
  }).onOk(() => {
    usersStore.deleteUser(item)
  })
}

const desActivar = (item) => {
  const status = item.is_active ? false : true
  const message = item.is_active
    ? 'Realmente desea desactivar el usuario?'
    : 'Realmente desea activar el usuario?'
  $q.dialog({
    title: 'Confirmar',
    message: message,
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Confirmar', flat: true, color: 'secondary' },
    persistent: true,
  }).onOk(() => {
    usersStore.desactivar({ id: item.id, status })
  })
}

const close = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    selectTipoDoc.value = ''
    selectRoles.value = []
    editCreate.value = false
  }, 200)
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))

// Helper para permisos: permite acceso si tiene 'system' o 'admin'
function canAccess(permission) {
  return laravelCan(permission) || laravelCan(permission.replace('system', 'admin'));
}

onMounted(async () => {
  if (!canAccess('system.index')) {
    router.push({ path: '/dashboard' })
  } else {
    await usersStore.loadUsers()
    await rolesStore.loadRoles()
    loadingPe.value = false
  }
})
</script>
