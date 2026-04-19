<template>
  <q-page>
    <div class="q-pa-md">
      <q-toolbar class="toolbar-header">
        <q-avatar v-if="getProductCategory?.imagen" size="38px">
          <img :src="urlRepo + getProductCategory.imagen" />
        </q-avatar>
        <div class="col text-center text-uppercase text-weight-bold">
          <q-btn flat :to="'/products/' + getProductCategory?.slug">
            {{ locale == 'es-CO' ? getProductCategory?.name : getProductCategory?.name_en }}
          </q-btn>
        </div>
      </q-toolbar>

      <div class="row main-container q-pt-lg" v-if="getProductDetail">
        <div class="col-md-6 col-xs-12 q-pa-sm" style="display: grid; justify-items: center">
          <q-img
            v-if="getProductDetail?.cover_img && getImagesProduct.length == 0"
            :src="urlRepo + getProductDetail.cover_img"
            basic
          />
          <q-carousel
            v-if="getImagesProduct.length > 0"
            swipeable
            animated
            v-model="slide"
            thumbnails
            infinite
          >
            <q-carousel-slide
              v-for="(imagen, index) in carouselImages"
              :key="index"
              :name="index"
              :img-src="urlRepo + imagen.image"
            />
          </q-carousel>
        </div>
        <div class="col-md-6 col-xs-12 q-pa-sm">
          <h4 v-if="locale == 'es-CO'">{{ getProductDetail?.name }}</h4>
          <h4 v-if="locale == 'en-US'">{{ getProductDetail?.name_en }}</h4>
          <p
            v-if="locale == 'es-CO'"
            class="text-caption text-grey text-justify"
            v-html="getProductDetail?.description"
          ></p>
          <p
            v-if="locale == 'en-US'"
            class="text-caption text-grey text-justify"
            v-html="getProductDetail?.description_en"
          ></p>

          <div
            v-if="getProductDetail?.alcohol_percentage"
            class="text-caption text-green-4 text-weight-bolder fs-16 q-mb-sm"
          >
            <span class="text-caption text-grey text-weight-bolder">Grados de Alcohol </span>
            {{ getProductDetail.alcohol_percentage }}
          </div>

          <div v-if="getProductDetail?.show_price && getProductDetail?.price">
            <span
              v-if="getProductDetail?.discount_active && getProductDetail.discount_percent > 0"
              class="discount"
              >- {{ getProductDetail.discount_percent }}%</span
            >
            <span
              :class="`${getProductDetail?.discount_active && getProductDetail.discount_percent > 0 ? 'price-discount ' : ''}text-caption text-weight-bolder fs-16 q-mb-sm`"
            >
              {{
                locale == 'es-CO'
                  ? formatPrice(getProductDetail.price)
                  : formatPrice(getProductDetail.price_usd)
              }}
            </span>
            <span
              v-if="getProductDetail?.discount_active && getProductDetail.discount_percent > 0"
              class="price-discounted"
              >{{
                locale == 'es-CO'
                  ? priceDiscount(getProductDetail.price, getProductDetail.discount_percent)
                  : priceDiscount(getProductDetail.price_usd, getProductDetail.discount_percent)
              }}</span
            >
          </div>

          <div class="q-mt-lg">
            <q-card-section v-if="getProductQuantity(getProductDetail.id) == 0">
              <q-btn
                outline
                icon-right="add_shopping_cart"
                @click="addItem(getProductDetail)"
                :label="locale == 'es-CO' ? 'Agregar' : 'Add to cart'"
              />
            </q-card-section>
            <q-card-section class="row q-mb-md" v-if="getProductQuantity(getProductDetail.id) >= 1">
              <q-btn
                v-if="getProductQuantity(getProductDetail.id) == 1"
                flat
                round
                icon="delete"
                @click="removeFromCart(getProductDetail.id)"
              />
              <q-btn
                v-if="getProductQuantity(getProductDetail.id) > 1"
                flat
                round
                icon="remove"
                @click="decreaseQuantity(getProductDetail.id)"
              />
              <q-input
                outlined
                dense
                style="width: 60px"
                :model-value="getProductQuantity(getProductDetail.id)"
                class="q-mx-md"
                @update:model-value="updateQuantity(getProductDetail.id, $event)"
              />
              <q-btn
                flat
                round
                icon="add"
                @click="increaseQuantity(getProductDetail.id)"
              />
            </q-card-section>
          </div>
        </div>
      </div>
      <div class="row text-center q-pt-lg" v-else>
        <div class="col-md-6 offset-md-3 col-xs-12 q-pa-sm">
          Cargando producto...
          <q-spinner-hourglass  size="5em"></q-spinner-hourglass>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18nStore } from 'src/stores/i18nStore'
import { useProductsStore } from 'src/stores/products'
import { useCartStore } from 'src/stores/shoppingCart'
import { useI18n } from 'vue-i18n'
import { useUtils } from 'src/composables/useUtils'
import { apiBaseURL } from 'src/boot/api'

const { formatPrice, priceDiscount } = useUtils()

const i18nStore = useI18nStore()
const { locale: storeLocale } = storeToRefs(i18nStore)
const { locale } = useI18n({ useScope: 'global' })

const slide = ref(0)
const route = useRoute()
const productStore = useProductsStore()
const urlRepo = `${apiBaseURL}/`

// const productId = computed(() => route.params.id)
const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)
const { addToCart, removeFromCart, updateQuantity } = cartStore

const getProductCategory = computed(() => productStore.getProductCategory)
const getProductDetail = computed(() => productStore.getProductDetail)
const getImagesProduct = computed(() => productStore.getImagesProduct)

const addItem = (item) => {
  const arti = { ...item, quantity: 1 }
  addToCart(arti)
}

const getProductQuantity = (id) => {
  const item = cart.value.find((p) => p.id === id)
  return item ? item.quantity : 0
}

const increaseQuantity = (id) => {
  const item = cart.value.find((p) => p.id === id)
  if (item) updateQuantity(id, Number(item.quantity) + 1)
}

const decreaseQuantity = (id) => {
  const item = cart.value.find((p) => p.id === id)
  if (item && item.quantity > 1) {
    updateQuantity(id, item.quantity - 1)
  }
}

const carouselImages = computed(() => {
  let images = []

  if (getProductDetail.value?.cover_img) {
    images.push({ id: 'cover', image: getProductDetail.value.cover_img })
  }

  if (getImagesProduct.value.length > 0) {
    images = images.concat(getImagesProduct.value)
  }

  return images
})

const fetchData = async () => {
  const productId = route.params.id
  if (productId) {
    productStore.categoryProduct = {}
    productStore.productDetail = {}
    productStore.imagesProduct = {}
    await productStore.fetchProductDetail(productId)
  }
}

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchData()
    }
  },
)

onMounted(() => {
  fetchData()
  locale.value = storeLocale.value
})
</script>

<style lang="scss" scoped>
.main-container {
  max-width: 1200px;
  margin: 0 auto;
}
.fs-14 {
  font-size: 14px;
}
.fs-16 {
  font-size: 16px;
}
.fs-18 {
  font-size: 18px;
}
.text-caption {
  font-size: 1rem;
}
.discount {
  font-weight: 500;
  font-size: 14px;
  background: #ff9800;
  color: white;
  padding: 3px 5px;
  border-radius: 5px;
  margin-right: 5px;
}
.price-discount {
  text-decoration: line-through;
  color: #9e9e9e !important;
  font-weight: 500;
}
.price-discounted {
  font-weight: 600;
  font-size: 16px;
  margin-left: 8px;
}
.q-carousel {
  margin: 50px 0 0;
  width: 100%;
  max-width: 500px;
  height: 360px;

  @media screen and (min-width: 365px) {
    height: 400px;
  }
  @media screen and (min-width: 411px) {
    height: 460px;
  }
  @media screen and (min-width: 511px) {
    height: 570px;
  }
  @media screen and (min-width: 768px) {
    height: 580px;
  }
  @media screen and (min-width: 1024px) {
    height: 430px;
  }
  @media screen and (min-width: 1200px) {
    height: 580px;
  }
}
.q-carousel__slide {
  background-size: contain !important;
  background-position: top center !important;
  background-repeat: no-repeat !important;
}
.q-carousel__slides-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
}
</style>
