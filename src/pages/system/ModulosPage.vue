<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Gestión de Módulos</div>
          <q-btn 
            color="primary" 
            label="Nuevo Módulo" 
            icon="add" 
            @click="openModuloModal()" 
          />
        </div>
        
        <q-table
          :rows="modulos"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
          rows-per-page-label="Filas por página"
          no-data-label="No hay módulos disponibles"
          loading-label="Cargando módulos..."
        >
          <template v-slot:body-cell-precio_mensual="props">
            <q-td :props="props">
              <div class="text-weight-medium text-primary">
                ${{ parseFloat(props.row.precio_mensual).toFixed(2) }}
              </div>
              <div class="text-caption text-grey">por mes</div>
            </q-td>
          </template>
          
          <template v-slot:body-cell-precio_anual="props">
            <q-td :props="props">
              <div class="text-weight-medium text-primary">
                ${{ parseFloat(props.row.precio_anual).toFixed(2) }}
              </div>
              <div class="text-caption text-grey">por año</div>
            </q-td>
          </template>
          
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-toggle 
                v-model="props.row.is_active" 
                @update:model-value="toggleStatus(props.row)" 
                color="positive"
                checked-icon="check"
                unchecked-icon="close"
              />
            </q-td>
          </template>
          
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn 
                size="sm" 
                color="info" 
                icon="edit" 
                flat 
                round
                @click="editModulo(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn 
                size="sm" 
                color="negative" 
                icon="delete" 
                flat 
                round
                @click="deleteModulo(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal para crear/editar módulo -->
    <q-dialog v-model="moduloModal" persistent>
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editMode ? 'Editar Módulo' : 'Nuevo Módulo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="loadingSave" />
        </q-card-section>

        <q-card-section>
          <q-input 
            v-model="moduloForm.nombre_modulo" 
            label="Nombre del Módulo" 
            outlined 
            class="q-mb-md"
            :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="widgets" />
            </template>
          </q-input>
          
          <q-input 
            v-model="moduloForm.slug" 
            label="Slug (URL amigable)" 
            outlined 
            class="q-mb-md"
            hint="Dejar vacío para generar automáticamente desde el nombre"
          >
            <template v-slot:prepend>
              <q-icon name="tag" />
            </template>
          </q-input>
          
          <q-input 
            v-model="moduloForm.descripcion" 
            label="Descripción" 
            outlined 
            type="textarea"
            rows="3"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="description" />
            </template>
          </q-input>
          
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input 
                v-model.number="moduloForm.precio_mensual" 
                label="Precio Mensual" 
                outlined 
                type="number"
                step="0.01"
                min="0"
                prefix="$"
                :rules="[val => val >= 0 || 'El precio debe ser mayor o igual a 0']"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" />
                </template>
              </q-input>
            </div>
            
            <div class="col-6">
              <q-input 
                v-model.number="moduloForm.precio_anual" 
                label="Precio Anual" 
                outlined 
                type="number"
                step="0.01"
                min="0"
                prefix="$"
                :rules="[val => val >= 0 || 'El precio debe ser mayor o igual a 0']"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" />
                </template>
              </q-input>
            </div>
          </div>
          
          <q-toggle 
            v-model="moduloForm.is_active" 
            label="Módulo activo" 
            color="positive"
            class="q-mb-md"
          />
          
          <q-banner v-if="!moduloForm.is_active" class="bg-warning text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="warning" color="white" />
            </template>
            Los módulos inactivos no estarán disponibles para asignación a tenants
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn 
            flat 
            label="Cancelar" 
            v-close-popup 
            :disable="loadingSave" 
          />
          <q-btn 
            color="primary" 
            label="Guardar" 
            @click="saveModulo" 
            :loading="loadingSave"
            :disable="loadingSave"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useModulosStore } from 'src/stores/modulos'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const modulosStore = useModulosStore()

// Estado
const modulos = ref([])
const loading = ref(false)
const moduloModal = ref(false)
const editMode = ref(false)
const loadingSave = ref(false)

// Formulario
const moduloForm = ref({
  nombre_modulo: '',
  slug: '',
  descripcion: '',
  precio_mensual: 0,
  precio_anual: 0,
  is_active: true
})

// Columnas de la tabla
const columns = [
  {
    name: 'nombre_modulo',
    label: 'Nombre',
    field: 'nombre_modulo',
    align: 'left',
    sortable: true
  },
  {
    name: 'slug',
    label: 'Slug',
    field: 'slug',
    align: 'left',
    sortable: true
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    style: 'max-width: 200px; overflow: hidden; text-overflow: ellipsis'
  },
  {
    name: 'precio_mensual',
    label: 'Precio Mensual',
    field: 'precio_mensual',
    align: 'center',
    sortable: true
  },
  {
    name: 'precio_anual',
    label: 'Precio Anual',
    field: 'precio_anual',
    align: 'center',
    sortable: true
  },
  {
    name: 'is_active',
    label: 'Estado',
    field: 'is_active',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

// Métodos
const loadModulos = async () => {
  loading.value = true
  try {
    modulos.value = await modulosStore.fetchModulos()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar módulos',
      caption: error.message || 'Inténtalo nuevamente'
    })
  } finally {
    loading.value = false
  }
}

const openModuloModal = () => {
  editMode.value = false
  moduloForm.value = {
    nombre_modulo: '',
    slug: '',
    descripcion: '',
    precio_mensual: 0,
    precio_anual: 0,
    is_active: true
  }
  moduloModal.value = true
}

const editModulo = (modulo) => {
  editMode.value = true
  moduloForm.value = {
    id: modulo.id,
    nombre_modulo: modulo.nombre_modulo,
    slug: modulo.slug,
    descripcion: modulo.descripcion || '',
    precio_mensual: parseFloat(modulo.precio_mensual),
    precio_anual: parseFloat(modulo.precio_anual),
    is_active: modulo.is_active
  }
  moduloModal.value = true
}

const saveModulo = async () => {
  loadingSave.value = true
  try {
    if (editMode.value) {
      await modulosStore.updateModulo(moduloForm.value.id, moduloForm.value)
      $q.notify({
        type: 'positive',
        message: 'Módulo actualizado exitosamente',
        icon: 'check_circle'
      })
    } else {
      await modulosStore.createModulo(moduloForm.value)
      $q.notify({
        type: 'positive',
        message: 'Módulo creado exitosamente',
        icon: 'check_circle'
      })
    }
    moduloModal.value = false
    await loadModulos()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: editMode.value ? 'Error al actualizar módulo' : 'Error al crear módulo',
      caption: error.message || 'Inténtalo nuevamente'
    })
  } finally {
    loadingSave.value = false
  }
}

const toggleStatus = async (modulo) => {
  try {
    await modulosStore.toggleStatus(modulo.id)
    $q.notify({
      type: 'positive',
      message: `Módulo ${modulo.is_active ? 'activado' : 'desactivado'} exitosamente`,
      icon: 'check_circle'
    })
  } catch (error) {
    // Revertir el toggle en caso de error
    modulo.is_active = !modulo.is_active
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar el estado del módulo',
      caption: error.message || 'Inténtalo nuevamente'
    })
  }
}

const deleteModulo = (modulo) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el módulo "${modulo.nombre_modulo}"? Esta acción no se puede deshacer.`,
    cancel: {
      label: 'Cancelar',
      flat: true
    },
    ok: {
      label: 'Eliminar',
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      await modulosStore.deleteModulo(modulo.id)
      $q.notify({
        type: 'positive',
        message: 'Módulo eliminado exitosamente',
        icon: 'check_circle'
      })
      await loadModulos()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar módulo',
        caption: error.message || 'El módulo puede tener tenants asociados'
      })
    }
  })
}

// Lifecycle
onMounted(() => {
  loadModulos()
})
</script>

<style scoped>
.text-caption {
  font-size: 0.7rem;
}
</style>
