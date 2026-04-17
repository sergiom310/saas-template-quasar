<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Tenants</div>
        <q-btn color="primary" label="Nuevo Tenant" @click="openTenantModal()" class="q-mb-md" />
        <q-table
          :rows="tenants"
          :columns="columns"
          row-key="id"
          :loading="loading"
        >
          <template v-slot:body-cell-modulos="props">
            <q-td :props="props">
              <div v-if="props.row.modulos && props.row.modulos.length > 0">
                <q-badge
                  v-for="modulo in props.row.modulos"
                  :key="modulo.id"
                  color="primary"
                  class="q-mr-xs"
                >
                  {{ modulo.nombre_modulo }}
                </q-badge>
              </div>
              <span v-else class="text-grey">Sin módulos</span>
            </q-td>
          </template>
          <template v-slot:body-cell-expires_at="props">
            <q-td :props="props">
              {{ formatearFecha(props.row.expires_at) }}
            </q-td>
          </template>
          <template v-slot:body-cell-is_active="props">
            <q-toggle v-model="props.row.is_active" @update:model-value="toggleActive(props.row)" />
          </template>
          <template v-slot:body-cell-estado_pago="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.estado_pago ? 'positive' : 'warning'"
                :label="props.row.estado_pago ? 'Pagado' : 'Pendiente'"
                :icon="props.row.estado_pago ? 'check_circle' : 'schedule'"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-btn v-if="false" size="sm" color="secondary" label="Crear BD" @click="createDatabase(props.row)" class="q-ml-sm" disable />
            <q-btn v-if="false" size="sm" color="primary" label="Migrar" @click="migrateTenant(props.row)" disable />
            <q-btn size="sm" color="positive" icon="attach_money" label="Pagos" @click="openPagosModal(props.row)" />
            <q-btn size="sm" color="info" icon="edit" @click="editTenant(props.row)" class="q-ml-sm" />
            <q-btn size="sm" color="negative" icon="delete" @click="deleteTenant(props.row)" class="q-ml-sm" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal para crear/editar tenant -->
    <q-dialog v-model="tenantModal">
      <q-card style="width: 480px; max-width: 580px">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Editar Tenant' : 'Nuevo Tenant' }}</div>
          <q-input v-model="tenantForm.name" label="Nombre" outlined class="q-mb-md" />
          <q-input v-model="tenantForm.name_company" label="Nombre de la Empresa" outlined class="q-mb-md" />
          <q-input 
            v-model="tenantForm.domain" 
            label="Dominio" 
            outlined 
            class="q-mb-md"
            hint="Nombre de base de datos sugerido igual al dominio, pero puede cambiarlo antes de guardar"
          />
          <q-input 
            v-model="tenantForm.database" 
            label="Base de datos" 
            outlined 
            class="q-mb-md" 
            :readonly="editMode"
            :disable="editMode"
            :hint="editMode ? 'El nombre de la base de datos no puede modificarse una vez creada' : 'Se autocompletó con el dominio, pero puede cambiarlo'"
          />
          <q-input v-model="tenantForm.owner_email" label="Email propietario" outlined class="q-mb-md" />
          <q-input 
            v-model="tenantForm.expires_at" 
            label="Fecha de expiración" 
            outlined 
            class="q-mb-md" 
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date 
                    v-model="tenantForm.expires_at" 
                    mask="YYYY-MM-DD"
                    default-year-month="2026/02"
                    today-btn
                    title="Fecha de Expiración"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          
          <!-- Selección de Módulos -->
          <div class="text-subtitle2 q-mb-sm">Módulos</div>
          <q-select
            v-model="tenantForm.modulos_selected"
            :options="modulosDisponibles"
            option-value="id"
            option-label="nombre_modulo"
            multiple
            outlined
            emit-value
            map-options
            label="Seleccionar módulos"
            hint="Seleccione uno o más módulos para este tenant"
            class="q-mb-md"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombre_modulo }}</q-item-label>
                  <q-item-label caption>
                    Mensual: ${{ scope.opt.precio_mensual }} | Anual: ${{ scope.opt.precio_anual }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          
          <!-- Método de pago (solo si hay módulos seleccionados) -->
          <q-select
            v-if="tenantForm.modulos_selected && tenantForm.modulos_selected.length > 0"
            v-model="tenantForm.metodo_pago"
            :options="[
              { label: 'Mensual', value: 'mensual' },
              { label: 'Anual', value: 'anual' }
            ]"
            option-value="value"
            option-label="label"
            outlined
            emit-value
            map-options
            label="Método de pago"
            hint="Seleccione el método de pago para los módulos"
            class="q-mb-md"
          />
          
          <q-toggle v-model="tenantForm.is_active" label="Activo" class="q-mb-sm" />
          <q-toggle v-model="tenantForm.estado_pago" label="Estado de pago" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup :disable="loadingSave" />
          <q-btn 
            color="primary" 
            label="Guardar" 
            @click="saveTenant" 
            :loading="loadingSave"
            :disable="loadingSave"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para pagos de módulos -->
    <q-dialog v-model="pagosModal" persistent>
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Registrar Pago - {{ tenantSeleccionado?.name }}</div>
          <div class="text-caption text-grey">{{ tenantSeleccionado?.name_company }}</div>
        </q-card-section>

        <q-card-section>
          <div v-if="modulosPago.length === 0" class="text-center text-grey q-pa-md">
            <q-icon name="info" size="md" />
            <div class="q-mt-sm">Este tenant no tiene módulos asignados</div>
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-md">Módulos del tenant:</div>
            
            <q-list bordered separator>
              <q-item v-for="(modulo, index) in modulosPago" :key="modulo.id + '-' + index" class="q-pa-md">
                <q-item-section>
                  <q-item-label class="text-bold">{{ modulo.nombre_modulo }}</q-item-label>
                  <q-item-label caption>
                    Fecha inicio: {{ formatearFecha(modulo.pivot.fecha_inicio) }}
                  </q-item-label>
                  <q-item-label caption>
                    Fecha vencimiento: {{ formatearFecha(modulo.pivot.fecha_vencimiento) }}
                  </q-item-label>
                  <q-item-label caption class="q-mt-sm">
                    <q-badge 
                      :color="modulo.pivot.metodo_pago === 'mensual' ? 'blue' : 'purple'"
                      :label="modulo.pivot.metodo_pago === 'mensual' ? 'Mensual' : 'Anual'"
                    />
                  </q-item-label>
                  
                  <!-- Select para cambiar método de pago -->
                  <q-select
                    v-model="modulo.nuevo_metodo_pago"
                    :options="[
                      { label: 'Mensual - $' + formatoPrecio(modulo.precio_mensual), value: 'mensual' },
                      { label: 'Anual - $' + formatoPrecio(modulo.precio_anual), value: 'anual' }
                    ]"
                    option-value="value"
                    option-label="label"
                    outlined
                    dense
                    emit-value
                    map-options
                    label="Método de pago para esta renovación"
                    class="q-mt-md"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Campos adicionales del pago -->
            <q-input
              v-model="pagoForm.referencia_pago"
              label="Referencia de pago (opcional)"
              outlined
              dense
              class="q-mt-md"
              hint="Número de transacción, recibo, etc."
            />
            
            <q-input
              v-model="pagoForm.notas"
              label="Notas (opcional)"
              outlined
              dense
              type="textarea"
              rows="2"
              class="q-mt-md"
              hint="Información adicional sobre el pago"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup :disable="loadingPago" />
          <q-btn 
            v-if="modulosPago.length > 0"
            color="positive" 
            icon="attach_money"
            label="Procesar Pago" 
            @click="procesarPago" 
            :loading="loadingPago"
            :disable="loadingPago"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { Notify, Dialog, date, Loading } from 'quasar'

const tenants = ref([])
const loading = ref(false)
const loadingSave = ref(false)
const tenantModal = ref(false)
const editMode = ref(false)
const modulosDisponibles = ref([])
const tenantForm = ref({
  id: null,
  name: '',
  name_company: '',
  domain: '',
  database: '',
  owner_email: '',
  expires_at: '',
  is_active: false,
  estado_pago: false,
  modulos_selected: [],
  metodo_pago: 'mensual'
})

// Variables para el modal de pagos
const pagosModal = ref(false)
const tenantSeleccionado = ref(null)
const modulosPago = ref([])
const loadingPago = ref(false)
const pagoForm = ref({
  referencia_pago: '',
  notas: ''
})

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
  { name: 'domain', label: 'Dominio', field: 'domain', align: 'left' },
  { name: 'database', label: 'Base de datos', field: 'database', align: 'left' },
  { name: 'owner_email', label: 'Email propietario', field: 'owner_email', align: 'left' },
  { name: 'modulos', label: 'Módulos', field: 'modulos', align: 'left' },
  { name: 'expires_at', label: 'Expira el', field: 'expires_at', align: 'left' },
  { name: 'is_active', label: 'Activo', field: 'is_active', align: 'center' },
  { name: 'estado_pago', label: 'Estado Pago', field: 'estado_pago', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  try {
    // Extraer solo la parte de fecha sin conversión de zona horaria
    // Soporta formatos: YYYY-MM-DDT..., YYYY-MM-DD HH:mm:ss, YYYY-MM-DD
    const fechaStr = fecha.split('T')[0].split(' ')[0]
    const [year, month, day] = fechaStr.split('-')
    return `${day}/${month}/${year}`
  } catch (error) {
    console.log(error)
    return fecha
  }
}

// Sincronizar domain con database solo cuando se crea un nuevo tenant
watch(() => tenantForm.value.domain, (newDomain) => {
  if (!editMode.value) {
    tenantForm.value.database = newDomain
  }
})

const fetchTenants = async () => {
  loading.value = true
  Loading.show()
  try {
    const res = await api.get('/api/tenants')
    tenants.value = res.data
  } catch (e) {
    console.log(e)
    Notify.create({ type: 'negative', message: 'Error al cargar tenants' })
  } finally {
    loading.value = false
    Loading.hide()
  }
}

const fetchModulos = async () => {
  try {
    const res = await api.get('/api/modulos')
    modulosDisponibles.value = res.data
  } catch (e) {
    console.log(e)
    Notify.create({ type: 'negative', message: 'Error al cargar módulos' })
  }
}

const openTenantModal = () => {
  editMode.value = false
  tenantForm.value = { 
    id: null, 
    name: '', 
    name_company: '', 
    domain: '', 
    database: '', 
    owner_email: '', 
    expires_at: '', 
    is_active: false,
    estado_pago: false,
    modulos_selected: [],
    metodo_pago: 'mensual'
  }
  tenantModal.value = true
}

const editTenant = (tenant) => {
  editMode.value = true
  // Convertir fecha al formato YYYY-MM-DD si viene del backend
  // Maneja formatos: YYYY-MM-DD HH:mm:ss, YYYY-MM-DDT HH:mm:ss.000000Z, etc.
  let expires_at = ''
  if (tenant.expires_at) {
    try {
      const fechaObj = new Date(tenant.expires_at)
      expires_at = date.formatDate(fechaObj, 'YYYY-MM-DD')
    } catch (error) {
      console.log(error)
      expires_at = tenant.expires_at.split('T')[0].split(' ')[0]
    }
  }
  
  // Extraer IDs de módulos si existen
  const modulos_selected = tenant.modulos ? tenant.modulos.map(m => m.id) : []
  const metodo_pago = tenant.modulos && tenant.modulos.length > 0 
    ? tenant.modulos[0].pivot.metodo_pago 
    : 'mensual'
  
  tenantForm.value = { 
    ...tenant, 
    expires_at,
    modulos_selected,
    metodo_pago
  }
  tenantModal.value = true
}

const saveTenant = async () => {
  loadingSave.value = true
  Loading.show()
  try {
    // Preparar datos para enviar
    const dataToSend = {
      name: tenantForm.value.name,
      name_company: tenantForm.value.name_company,
      domain: tenantForm.value.domain,
      database: tenantForm.value.database,
      owner_email: tenantForm.value.owner_email,
      expires_at: tenantForm.value.expires_at,
      is_active: tenantForm.value.is_active,
      estado_pago: tenantForm.value.estado_pago
    }
    
    // Agregar módulos si hay seleccionados
    if (tenantForm.value.modulos_selected && tenantForm.value.modulos_selected.length > 0) {
      dataToSend.modulos = tenantForm.value.modulos_selected.map(moduloId => ({
        modulo_id: moduloId,
        metodo_pago: tenantForm.value.metodo_pago
      }))
    }
    
    if (editMode.value) {
      await api.put(`/api/tenants/${tenantForm.value.id}`, dataToSend)
      Notify.create({ type: 'positive', message: 'Tenant actualizado' })
    } else {
      await api.post('/api/tenants', dataToSend)
      Notify.create({ type: 'positive', message: 'Tenant creado' })
    }
    tenantModal.value = false
    await fetchTenants()
  } catch (e) {
    console.error('Error al guardar tenant:', e)
    const errorMsg = e.response?.data?.message || e.message || 'Error al guardar tenant'
    Notify.create({ type: 'negative', message: errorMsg })
  } finally {
    loadingSave.value = false
    Loading.hide()
  }
}

const deleteTenant = (tenant) => {
  Dialog.create({
    title: 'Eliminar Tenant',
    message: `¿Seguro que deseas eliminar el tenant ${tenant.name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    loading.value = true
    Loading.show()
    try {
      await api.delete(`/api/tenants/${tenant.id}`)
      Notify.create({ type: 'positive', message: 'Tenant eliminado' })
      fetchTenants()
    } catch (e) {
      console.log(e)
      Notify.create({ type: 'negative', message: 'Error al eliminar tenant' })
    } finally {
      loading.value = false
      Loading.hide()
    }
  })
}

const toggleActive = async (tenant) => {
  loading.value = true
  Loading.show()
  try {
    // Solo enviar el campo is_active para evitar validaciones innecesarias
    await api.put(`/api/tenants/${tenant.id}`, { is_active: tenant.is_active })
    Notify.create({ type: 'positive', message: 'Estado actualizado' })
    fetchTenants()
  } catch (e) {
    console.log(e)
    Notify.create({ type: 'negative', message: 'Error al actualizar estado' })
  } finally {
    loading.value = false
    Loading.hide()
  }
}

const migrateTenant = async (tenant) => {
  Dialog.create({
    title: '⚠️ Confirmar Migración',
    message: `<div style="line-height: 1.6;">
      <p><strong>¡Cuidado!</strong></p>
      <p>Este proceso elimina las tablas y las vuelve a crear, lo que podría ocasionar <strong>pérdida de información</strong>.</p>
      <p>¿Desea proceder con la migración del tenant <strong>${tenant.name}</strong>?</p>
    </div>`,
    html: true,
    cancel: { label: 'Cancelar', color: 'grey' },
    ok: { label: 'Sí, Migrar', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    loading.value = true
    Loading.show()
    try {
      await api.post(`/api/tenants/${tenant.id}/migrate`)
      Notify.create({ type: 'positive', message: 'Migración ejecutada' })
      fetchTenants()
    } catch (e) {
      console.log(e)
      Notify.create({ type: 'negative', message: 'Error al migrar tenant' })
    } finally {
      loading.value = false
      Loading.hide()
    }
  })
}

const createDatabase = async (tenant) => {
  Dialog.create({
    title: 'Confirmar creación de BD',
    message: `¿Seguro que deseas crear la base de datos para el tenant ${tenant.name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    loading.value = true
    Loading.show()
    try {
      const res = await api.post(`/api/tenants/${tenant.id}/create-database`)
      if (res.status === 409) {
        Notify.create({ type: 'warning', message: res.data.message || 'La base de datos ya existe para este tenant' })
      } else {
        Notify.create({ type: 'positive', message: res.data.message || 'Base de datos creada para el tenant' })
      }
      fetchTenants()
    } catch (e) {
      console.log(e)
      const msg = e.response?.data?.message || 'Error al crear base de datos'
      Notify.create({ type: 'negative', message: msg })
    } finally {
      loading.value = false
      Loading.hide()
    }
  })
}

const formatoPrecio = (precio) => {
  if (!precio) return '0.00'
  return parseFloat(precio).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const openPagosModal = (tenant) => {
  tenantSeleccionado.value = tenant
  
  // Copiar módulos y agregar campo para el nuevo método de pago
  modulosPago.value = tenant.modulos ? tenant.modulos.map(modulo => ({
    ...modulo,
    nuevo_metodo_pago: modulo.pivot.metodo_pago // Por defecto, mantener el actual
  })) : []
  
  // Resetear formulario
  pagoForm.value = {
    referencia_pago: '',
    notas: ''
  }
  
  pagosModal.value = true
}

const procesarPago = async () => {
  if (!tenantSeleccionado.value || modulosPago.value.length === 0) return
  
  loadingPago.value = true
  Loading.show({ message: 'Procesando pago...' })
  
  try {
    // Preparar datos de módulos para el pago
    const modulosData = modulosPago.value.map(modulo => ({
      modulo_id: modulo.id,
      metodo_pago: modulo.nuevo_metodo_pago
    }))
    
    const dataToSend = {
      modulos: modulosData,
      referencia_pago: pagoForm.value.referencia_pago || null,
      notas: pagoForm.value.notas || null
    }
    
    const res = await api.post(`/api/tenants/${tenantSeleccionado.value.id}/pago-modulo`, dataToSend)
    
    Notify.create({
      type: 'positive',
      message: 'Pago registrado exitosamente',
      caption: `Fecha: ${date.formatDate(res.data.fecha_pago, 'DD/MM/YYYY HH:mm')}`
    })
    
    pagosModal.value = false
    await fetchTenants()
    
  } catch (e) {
    console.error('Error al procesar pago:', e)
    const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Error al procesar el pago'
    Notify.create({
      type: 'negative',
      message: errorMsg
    })
  } finally {
    loadingPago.value = false
    Loading.hide()
  }
}

onMounted(() => {
  fetchTenants()
  fetchModulos()
})
</script>

<style scoped>
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
