<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Productos </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="products"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingPr"
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
            <q-td key="cost" :props="props">
              {{ formatPrice(props.row.cost) }}
            </q-td>
            <q-td key="price" :props="props">
              {{ formatPrice(props.row.price) }}
            </q-td>
            <q-td key="category" :props="props">
              {{ props.row.category }}
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
                color="black"
                @click.stop="desActivar(props.row)"
                title="Activar/Desactivar"
                v-if="laravelCan('admin.update')"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="visibility"
                color="green"
                @click.stop="showViewModal(props.row)"
                title="Ver detalles del producto"
                v-if="laravelCan('admin.update')"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="edit"
                color="primary"
                @click.stop="showEditModal(props.row)"
                title="Editar información"
                v-if="laravelCan('admin.update')"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                color="red"
                @click.stop="deleteItem(props.row.id)"
                title="Eliminar"
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
      <q-card style="width: 780px; max-width: 880px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.name"
              :rules="[(val) => !!val || 'El nombre del producto es requerido']"
              ref="name"
              label="Nombre"
              class="col"
            >
            </q-input>
          </div>
          <div class="row q-ma-md">
            Descripccion:
            <q-editor
              v-model="editedItem.description"
              :dense="$q.screen.lt.md"
              :toolbar="[
                [
                  {
                    label: $q.lang.editor.align,
                    icon: $q.iconSet.editor.align,
                    fixedLabel: true,
                    options: ['left', 'center', 'right', 'justify'],
                  },
                ],
                ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
                ['token', 'hr', 'link', 'custom_btn'],
                ['fullscreen'],
                [
                  {
                    label: $q.lang.editor.formatting,
                    icon: $q.iconSet.editor.formatting,
                    list: 'no-icons',
                    options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
                  },
                  {
                    label: $q.lang.editor.fontSize,
                    icon: $q.iconSet.editor.fontSize,
                    fixedLabel: true,
                    fixedIcon: true,
                    list: 'no-icons',
                    options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7'],
                  },
                  {
                    label: $q.lang.editor.defaultFont,
                    icon: $q.iconSet.editor.font,
                    fixedIcon: true,
                    list: 'no-icons',
                    options: [
                      'default_font',
                      'arial',
                      'arial_black',
                      'comic_sans',
                      'courier_new',
                      'impact',
                      'lucida_grande',
                      'times_new_roman',
                      'verdana',
                    ],
                  },
                  'removeFormat',
                ],
                ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
                ['undo', 'redo'],
                ['viewsource'],
              ]"
              :fonts="{
                arial: 'Arial',
                arial_black: 'Arial Black',
                comic_sans: 'Comic Sans MS',
                courier_new: 'Courier New',
                impact: 'Impact',
                lucida_grande: 'Lucida Grande',
                times_new_roman: 'Times New Roman',
                verdana: 'Verdana',
              }"
              ref="description"
              placeholder="Escriba aquí la descripción"
            ></q-editor>
          </div>
          <div class="row q-ma-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.cost"
                ref="cost"
                type="number"
                label="Costo"
                class="col"
              >
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.price"
                ref="price"
                type="number"
                label="Precio"
                class="col"
              >
              </q-input>
            </div>
          </div>
          <div class="row q-ma-md">
            <q-select
              outlined
              transition-show="jump-up"
              transition-hide="jump-up"
              v-model="selectBrands"
              :options="brands"
              option-value="id"
              option-label="name"
              ref="brand_id"
              label="Marca del Producto"
              class="col"
            />
          </div>
          <div class="row q-ma-md">
            <q-select
              outlined
              transition-show="jump-up"
              transition-hide="jump-up"
              multiple
              v-model="selectCategories"
              :options="categories"
              :rules="[(val) => val.length > 0 || 'Campo requerido']"
              option-value="id"
              option-label="name"
              ref="category_id"
              label="Categoría"
              class="col"
            />
          </div>
          <div class="row q-ma-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-toggle v-model="editedItem.show_price" ref="show_price" label="Mostrar precio" />
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-toggle
                v-model="editedItem.is_featured"
                ref="is_featured"
                label="Producto destacado"
              />
            </div>
          </div>
          <div class="row q-ma-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-toggle
                v-model="editedItem.stock_visible"
                ref="stock_visible"
                label="Mostrar stock"
              />
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-toggle
                v-model="editedItem.allow_backorder"
                ref="allow_backorder"
                label="Permitir pedidos sin stock"
              />
            </div>
          </div>
          <div class="row q-ma-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-toggle
                v-model="editedItem.discount_active"
                ref="discount_active"
                label="Aplicar Descuento"
              />
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.discount_percent"
                ref="discount_percent"
                label="Porcentaje de Descuento"
                type="number"
                class="col"
                :readonly="!editedItem.discount_active"
                :disabled="!editedItem.discount_active"
              >
              </q-input>
            </div>
          </div>
          <div class="row q-ma-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.min_order_qty"
                ref="min_order_qty"
                label="Cantidad mínima de compra"
                type="number"
                class="col"
              >
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.max_order_qty"
                ref="max_order_qty"
                label="Cantidad máxima de comprar"
                type="number"
                class="col"
              >
              </q-input>
            </div>
          </div>
          <div class="row q-pa-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-toggle
                v-model="editedItem.show_related"
                ref="show_related"
                label="Mostrar productos relacionados"
              />
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input outlined v-model="editedItem.stock" ref="stock" label="Stock" class="col">
              </q-input>
            </div>
          </div>
          <div class="row q-pa-md">
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input outlined v-model="editedItem.sku" ref="sku" label="Sku" class="col">
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-px-xs">
              <q-input
                outlined
                v-model="editedItem.barcode"
                ref="barcode"
                label="Código de Barras"
                class="col"
              >
              </q-input>
            </div>
          </div>

          <div class="row q-pa-md">
            <q-file
              outlined
              clearable
              :hint="hint_cover_img"
              v-model="model_cover_img"
              label="Seleccione Imagen del Producto"
              ref="cover_img"
              class="col"
              accept="image/*"
              @update:model-value="handleFileChange"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" class="primary" />
              </template>
            </q-file>
          </div>
        </q-form>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="close"></q-btn>
          <q-btn flat label="Guardar" color="primary" @click="save"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="details" class="q-pa-md q-gutter-sm" persistent>
      <q-card style="width: 890px; max-width: 890px">
        <q-toolbar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Detalle</span> Registro</q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Id:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ showItem.value.id }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Nombre:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ showItem.value.name }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Descripción:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ showItem.value.description }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Marca:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ showItem.value.brand.name }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Costo:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ formatPrice(showItem.value.cost) }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Precio:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ formatPrice(showItem.value.price) }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Categorías:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ showItem.value.category }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Creado el:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ formatDate(showItem.value.created_at) }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col"><div class="text-subtitle1">Última actualización:</div></div>
            <div class="col">
              <div class="text-subtitle2">{{ formatDate(showItem.value.updated_at) }}</div>
            </div>
          </div>
          <div class="row q-pt-xs">
            <div class="col">
              <span class="text-subtitle1">Imagen principal:</span>
              <q-img
                v-if="showItem.value.cover_img"
                :src="urlRepo + showItem.value.cover_img"
                basic
                style="height: auto; max-width: 260px"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator></q-separator>

        <div class="row q-ma-md text-subtitle1">Imágenes asociadas al Producto</div>

        <div class="row q-ma-md flex-center" v-if="images.length > 0">
          <q-card class="my-card q-mx-sm q-mb-sm" v-for="imagen in images" :key="imagen.id">
            <q-img :src="urlRepo + imagen.image" class="card-img">
            </q-img>
            <q-card-section absolute-bottom text-subtitle2>
              {{imagen.description ? '(' + imagen.description + ')' : ''}}
              <q-icon
                class="absolute all-pointer-events cursor-pointer"
                size="28px"
                name="delete"
                title="Eliminar"
                style="bottom: 2px; right: 2px"
                @click.stop="deleteImagen(imagen.id)"
              />
            </q-card-section>
          </q-card>
        </div>

        <q-separator></q-separator>

        <div class="row q-ma-md text-subtitle1">Cargar Imágenes al Producto</div>

        <div class="row q-ma-md">
          <div class="col-md-12 col-xs-12 q-px-xs">
            <q-uploader
              style="width: 100%"
              label="Cargar Imágenes"
              :factory="factoryFn"
              @added="selectedFiles"
              accept=".jpg, image/*"
              color="primary"
              ref="uploader1"
            />
          </div>
          <!-- <div class="col-md-6 col-xs-12 q-px-xs">
            <q-input
              outlined
              v-model="showItem.value.detail_img1"
              ref="detail_p1"
              label="Detalle de la imagen"
              class="col"
            >
            </q-input>
          </div> -->
        </div>

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
import { useProductsStore } from 'src/stores/products'
import { useCategoryStore } from 'src/stores/category'
import { useBrandsStore } from 'src/stores/brands'
import { laravelCan, formatDate } from 'src/functions/function-general'
import { useQuasar, QEditor } from 'quasar'

const $q = useQuasar()
const productsStore = useProductsStore()
const categoryStore = useCategoryStore()
const brandStore = useBrandsStore()

const urlRepo = `${import.meta.env.VITE_API_URL}/`
const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const selectCategories = ref([])
const selectBrands = ref({})
const images = ref([])
const model_cover_img = ref(null)
const hint_cover_img = ref('')
const loadingPr = ref(true)
const formRef = ref(null)

const showItem = {
  id: '',
  name: '',
  description: '',
  cost: '0',
  price: '0',
  cover_img: null,
  created_at: '',
  updated_at: '',
  brand: {},
  detail_img1: '',
  show_price: false,
  is_featured: false,
  stock_visible: false,
  allow_backorder: false,
  discount_active: false,
  discount_percent: 0,
  min_order_qty: 0,
  max_order_qty: 0,
  show_related: false,
}

const defaultItem = {
  id: '',
  name: '',
  description: '',
  cost: '0',
  price: '0',
  cover_img: null,
  brand: {},
  show_price: true,
  is_featured: false,
  stock_visible: false,
  allow_backorder: false,
  discount_active: false,
  discount_percent: 0,
  min_order_qty: 0,
  max_order_qty: 0,
  show_related: false,
}

const editedItem = ref({ ...defaultItem })
const filter = ref('')
const pagination = ref({ sortBy: 'id', descending: false, page: 1, rowsPerPage: 12 })

const columns = [
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  {
    name: 'cost',
    align: 'right',
    label: 'Costo',
    field: 'cost',
    sortable: true,
    format: (val) => formatPrice(val),
  },
  {
    name: 'price',
    align: 'right',
    label: 'Precio V',
    field: 'price',
    sortable: true,
    format: (val) => formatPrice(val),
  },
  { name: 'category', align: 'left', label: 'Categorías', field: 'category', sortable: false },
  {
    name: 'status',
    align: 'left',
    label: 'Estado',
    field: 'status',
    sortable: false,
    format: (val) => formatStatus(val),
  },
  {
    name: 'created_at',
    align: 'left',
    label: 'Creado el',
    field: 'created_at',
    sortable: true,
    format: (val) => formatDate(val, 'DD-MM-YYYY'),
  },
  { name: 'action', align: 'center', label: 'Acción' },
]

const formatPrice = (value) => {
  if (value === null || value === undefined) return '$0,00'
  const nueValue = new Intl.NumberFormat('en-EN', { minimumFractionDigits: 2 }).format(value)
  return `$${nueValue}`
}

const formatStatus = (value) => (value === 1 ? 'Activo' : 'Inactivo')

const handleFileChange = (file) => {
  editedItem.value.cover_imgFile = file || null;  
}

const openDialog = () => {
  selectBrands.value = { id: '', name: '' }
  editedItem.value = { ...defaultItem }
  dialog.value = true
}

const close = () => {
  dialog.value = false
  hint_cover_img.value = ''
  model_cover_img.value = null
  setTimeout(() => {
    editedItem.value = ref({ ...defaultItem })
    selectCategories.value = []
    editCreate.value = false
  }, 200)
}

const selectedFiles = (files) => {
  if (files.length !== 0) {
    editedItem.value.galery_img = files[0]
  }
}

const factoryFn = (file) => {
  showItem.value.galery_img = file[0]
  productsStore.updateImage(showItem.value)
  
  setTimeout(() => {
    details.value = false
  }, 800)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  editedItem.value.brand = selectBrands.value

  editedItem.value.category_id = selectCategories.value
  if (model_cover_img.value) editedItem.value.cover_img = model_cover_img.value

  editCreate.value
    ? productsStore.updateProduct(editedItem.value)
    : productsStore.addProduct(editedItem.value)
  close()
}

const desActivar = (item) => {
  const status = item.status ? 'Desactivar' : 'Activar'
  let intStatus = item.status == 'Activo' ? 'Inactivo' : 'Activo'
  $q.dialog({
    title: 'Confirmar',
    message: `¿Realmente desea ${status} el item?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    let prod = {
      id: item.id,
      status: intStatus,
    }
    productsStore.activateProduct(prod)
  })
}

const showViewModal = (item) => {
  showItem.value = { ...item }
  images.value = item.images

  setTimeout(() => {
    details.value = true
  }, 200)
}

const showEditModal = (item) => {
  editedItem.value = {
    ...item,
    show_price: !!item.show_price,
    is_featured: !!item.is_featured,
    stock_visible: !!item.stock_visible,
    allow_backorder: !!item.allow_backorder,
    discount_active: !!item.discount_active,
    show_related: !!item.show_related,
  }
  hint_cover_img.value = item.cover_img
  selectBrands.value = item.brand
  selectCategories.value = item.categories

  editCreate.value = true
  setTimeout(() => (dialog.value = true), 200)
}

const deleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Realmente desea eliminar el item?',
    cancel: true,
    persistent: true,
  }).onOk(() => productsStore.deleteProduct(item))
}

const deleteImagen = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Realmente desea eliminar la imagen?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    productsStore.deleteImage(id)
    setTimeout(() => (details.value = false), 500)
  })
}

const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))
const products = computed(() => productsStore.products)
const categories = computed(() => categoryStore.categories)
const brands = computed(() => brandStore.brands)

onMounted(async () => {
  if (!laravelCan('admin.index')) {
    window.location.href = '/dashboard'
  } else {
    await productsStore.loadProducts()
    await categoryStore.loadCategory()
    await brandStore.loadBrands()
    loadingPr.value = false
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
.my-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 250px;
  max-height: 280px;

  .q-img__image {
    object-fit: contain;
  }
  .q-card__section {
    margin-top: auto;
  }
}
.q-gutter-sm > * {
  margin-top: 0;
  margin-left: 0;
}
</style>
