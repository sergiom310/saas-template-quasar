<template>
  <q-page padding class="my-page">
    <q-toolbar class="toolbar-header">
      <q-btn flat round dense icon="business" />
      <q-toolbar-title>Mi Empresa</q-toolbar-title>
    </q-toolbar>

    <q-form ref="formRef" @submit.prevent="save" class="q-mt-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.nombre"
            label="Nombre de la Empresa *"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.nit"
            label="NIT / Identificación"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.telefono"
            label="Teléfono"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.email"
            label="Correo electrónico"
            type="email"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.ciudad"
            label="Ciudad"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.pais"
            label="País"
          />
        </div>
        <div class="col-12">
          <q-input
            outlined
            v-model="form.direccion"
            label="Dirección"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.sitio_web"
            label="Sitio Web"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.moneda"
            label="Moneda (ej: COP, USD)"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.impuesto_label"
            label="Etiqueta de impuesto (ej: IVA)"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            outlined
            v-model="form.impuesto_porcentaje"
            label="Porcentaje de impuesto"
            type="number"
            step="0.01"
          />
        </div>
        <div class="col-12">
          <q-input
            outlined
            v-model="form.descripcion"
            label="Descripción"
            type="textarea"
            rows="3"
          />
        </div>

        <!-- Logo -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 q-mb-sm">Logo</div>
          <div v-if="empresaStore.empresa?.logo && !form.logoFile" class="q-mb-sm">
            <img
              :src="urlRepo + empresaStore.empresa.logo"
              style="max-height: 80px; max-width: 200px; object-fit: contain"
              alt="Logo actual"
            />
          </div>
          <q-file
            outlined
            v-model="form.logoFile"
            label="Seleccionar logo"
            accept="image/*"
            @update:model-value="(f) => (form.logoFile = f || null)"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </div>

        <!-- Imagen header -->
        <div class="col-12 col-md-6">
          <div class="text-subtitle2 q-mb-sm">Imagen de cabecera (reportes)</div>
          <div v-if="empresaStore.empresa?.imagen_header && !form.imagenHeaderFile" class="q-mb-sm">
            <img
              :src="urlRepo + empresaStore.empresa.imagen_header"
              style="max-height: 80px; max-width: 200px; object-fit: contain"
              alt="Imagen cabecera actual"
            />
          </div>
          <q-file
            outlined
            v-model="form.imagenHeaderFile"
            label="Seleccionar imagen de cabecera"
            accept="image/*"
            @update:model-value="(f) => (form.imagenHeaderFile = f || null)"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </div>

        <div class="col-12 flex justify-end">
          <q-btn
            type="submit"
            color="primary"
            label="Guardar"
            icon="save"
            v-if="laravelCan('admin.create') || laravelCan('admin.update')"
          />
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { laravelCan } from 'src/functions/function-general'
import { useEmpresaStore } from 'src/stores/empresa'
import { useRouter } from 'vue-router'

const empresaStore = useEmpresaStore()
const router = useRouter()

const urlRepo = `${import.meta.env.VITE_API_URL}/`

const formRef = ref(null)

const defaultForm = {
  nombre: '',
  nit: '',
  direccion: '',
  telefono: '',
  email: '',
  sitio_web: '',
  ciudad: '',
  pais: 'Colombia',
  descripcion: '',
  moneda: 'COP',
  impuesto_label: 'IVA',
  impuesto_porcentaje: 19,
  logoFile: null,
  imagenHeaderFile: null,
}

const form = ref({ ...defaultForm })

const fillForm = () => {
  const data = empresaStore.empresa
  if (!data) return
  form.value = {
    nombre: data.nombre || '',
    nit: data.nit || '',
    direccion: data.direccion || '',
    telefono: data.telefono || '',
    email: data.email || '',
    sitio_web: data.sitio_web || '',
    ciudad: data.ciudad || '',
    pais: data.pais || 'Colombia',
    descripcion: data.descripcion || '',
    moneda: data.moneda || 'COP',
    impuesto_label: data.impuesto_label || 'IVA',
    impuesto_porcentaje: data.impuesto_porcentaje ?? 19,
    logoFile: null,
    imagenHeaderFile: null,
  }
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) return

  const formData = new FormData()
  formData.append('nombre', form.value.nombre)
  formData.append('nit', form.value.nit || '')
  formData.append('direccion', form.value.direccion || '')
  formData.append('telefono', form.value.telefono || '')
  formData.append('email', form.value.email || '')
  formData.append('sitio_web', form.value.sitio_web || '')
  formData.append('ciudad', form.value.ciudad || '')
  formData.append('pais', form.value.pais || '')
  formData.append('descripcion', form.value.descripcion || '')
  formData.append('moneda', form.value.moneda || '')
  formData.append('impuesto_label', form.value.impuesto_label || '')
  formData.append('impuesto_porcentaje', form.value.impuesto_porcentaje ?? '')

  if (form.value.logoFile) {
    formData.append('logo', form.value.logoFile, form.value.logoFile.name)
  }
  if (form.value.imagenHeaderFile) {
    formData.append('imagen_header', form.value.imagenHeaderFile, form.value.imagenHeaderFile.name)
  }

  await empresaStore.saveEmpresa(formData)
  form.value.logoFile = null
  form.value.imagenHeaderFile = null
}

onMounted(async () => {
  if (!laravelCan('admin.index')) {
    router.push({ path: '/dashboard' })
    return
  }
  await empresaStore.loadEmpresa()
  fillForm()
})
</script>

<style lang="scss" scoped>
.my-page {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}
.text-subtitle2 {
  font-weight: 600;
}
</style>
