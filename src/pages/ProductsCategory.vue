<template>
  <q-page>
    <div class="q-pa-xs">
      <q-toolbar dark class="bg-blue-grey-4 text-white">
        <q-avatar v-if="productCategory?.imagen" size="38px">
          <img :src="urlRepo + productCategory.imagen" />
        </q-avatar>
        <div class="col text-center text-uppercase text-weight-bold">
          {{ locale == 'es-CO' ? productCategory?.name : productCategory?.name_en }}
        </div>
      </q-toolbar>

      <div class="row flex-center" v-if="productCategory?.banner">
        <img :src="urlRepo + productCategory.banner" class="img_banner" />
      </div>

      <div class="main-container flex-center my-page">
        <div
          class="row q-pt-sm q-pa-md"
          v-if="productCategory?.description || productCategory?.description_en"
        >
          <p
            v-html="
              locale == 'es-CO' ? productCategory?.description : productCategory?.description_en
            "
          ></p>
        </div>

        <div v-if="productsList.length > 0">
          <div class="product-grid">
            <q-card class="product-card" v-for="item in productsList" :key="item.id">
              <q-img
                :src="urlRepo + item.cover_img"
                basic
                class="product-image cursor-pointer"
                @click="goToDetail(item.id)"
              >
                <span v-if="item?.discount_active && item.discount_percent > 0" class="discount"
                  >- {{ item.discount_percent }}%</span
                >              
              </q-img>

              <q-card-section class="q-pa-sm text-qcard-section">
                <div class="product-title cursor-pointer" @click="goToDetail(item.id)">
                  {{ capitalizeString(item.name, item.name_en) }}
                </div>
              </q-card-section>
              <div v-if="item?.show_price && item?.price" class="q-pa-sm q-price">
                <span
                  :class="`${item?.discount_active && item.discount_percent > 0 ? 'price-discount ' : ''}text-caption text-weight-bolder fs-16 q-mb-sm`"
                >
                  {{ locale == 'es-CO' ? formatPrice(item.price) : formatPrice(item.price_usd) }}
                </span>
                <span
                  v-if="item?.discount_active && item.discount_percent > 0"
                  class="price-discounted"
                  >{{
                    locale == 'es-CO'
                      ? priceDiscount(item.price, item.discount_percent)
                      : priceDiscount(item.price_usd, item.discount_percent)
                  }}</span
                >
              </div>
              <q-card-section class="row q-my-sm add-to-cart" v-if="getProductQuantity(item.id) == 0">
                <q-btn
                  color="primary"
                  outline
                  icon-right="add_shopping_cart"
                  class="add-to-cart-button"
                  @click="addItem(item)"
                  :label="locale == 'es-CO' ? 'Agregar' : 'Add to cart'"
                />
              </q-card-section>
              <q-card-section class="row q-my-sm set-quantity" v-if="getProductQuantity(item.id) >= 1">
                <q-btn
                  v-if="getProductQuantity(item.id) == 1"
                  flat
                  round
                  color="primary"
                  icon="delete"
                  class="buton-remove"
                  @click="removeFromCart(item.id)"
                />
                <q-btn
                  v-if="getProductQuantity(item.id) > 1"
                  flat
                  round
                  color="primary"
                  icon="remove"
                  class="buton-less"
                  @click="decreaseQuantity(item.id)"
                />
                <q-input
                  outlined
                  dense
                  style="width: 60px;height: 32px;"
                  :model-value="getProductQuantity(item.id)"
                  class="q-mx-md set-quantity--input"
                  @update:model-value="updateQuantity(item.id, $event)"
                />
                <q-btn flat round color="primary" class="buton-add" icon="add" @click="increaseQuantity(item.id)" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row text-center q-pt-lg" v-else>
          <div class="col-md-6 offset-md-3 col-xs-12 q-pa-sm">
            <span>
              {{ t('noProducts') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="[8, 8]" @click="goTop" v-if="showNavbar">
      <q-btn round color="primary" icon="arrow_upward" />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from 'src/stores/products'
import { useI18nStore } from 'src/stores/i18nStore'
import { useCartStore } from 'src/stores/shoppingCart'
import { useI18n } from 'vue-i18n'
import { useUtils } from 'src/composables/useUtils'

const { formatPrice, priceDiscount } = useUtils()

const i18nStore = useI18nStore()
const { locale: storeLocale } = storeToRefs(i18nStore)
const { locale, t } = useI18n({ useScope: 'global' })

const route = useRoute()
const router = useRouter()
const productStore = useProductsStore()

const cartStore = useCartStore()
const { cart } = storeToRefs(cartStore)
const { addToCart, removeFromCart, updateQuantity } = cartStore

const urlRepo = `${import.meta.env.VITE_API_URL}/`
const lastScrollPosition = ref(0)
const showNavbar = ref(false)

const productCategory = computed(() => productStore.getProductCategory)
const productsList = computed(() => productStore.getListProducts)

const goToDetail = (id) => {
  router.push(`/productdetail/${id}`)
}

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

const fetchDataList = async () => {
  const categoryId = route.params.slug
  if (categoryId) {
    await productStore.listProducts(categoryId)
  }
}

const capitalizeString = (value, value_en) => {
  const textToShow = locale.value == 'en-US' ? value_en : value
  return textToShow.charAt(0).toUpperCase() + textToShow.slice(1).toLowerCase()
}

const goTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  showNavbar.value = currentScrollPosition > 100 && currentScrollPosition > lastScrollPosition.value
  lastScrollPosition.value = currentScrollPosition
}

onMounted(() => {
  locale.value = storeLocale.value
  window.addEventListener('scroll', onScroll)
  fetchDataList()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

watch(() => route.params.slug, fetchDataList)
</script>

<style lang="scss" scoped>
.my-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.discount {
  position: absolute;
  top: 5px;
  right: 5px;
  font-weight: 500;
  font-size: 13px;
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
  font-size: 12px;
  margin-left: 8px;
}
.product-grid {
  display: grid;
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 10px;
  // grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  grid-template-columns: 1fr;
  justify-content: center;
  justify-items: center;

  @media (min-width: 360px) {
    grid-template-columns: 1fr 1fr;
    column-gap: 12px;
    row-gap: 18px;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    padding: 16px;
    gap: 16px;    
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.product-card {
  width: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: space-between;

  @media (min-width: 360px) {
    width: 100%;
  }
  @media (min-width: 511px) {
    width: 90%;
  } 
  @media (min-width: 768px) {
    width: 100%;
  } 
}

.product-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}
.text-qcard-section {
  width: 100%;
}
::v-deep(.add-to-cart) {
  padding: 0;
}
::v-deep(.add-to-cart-button) {
  font-size: 12px;
}
::v-deep(.set-quantity) {
  display: grid; grid-template-columns: 1fr auto 1fr;  
  align-items: center;
  align-content: center;
  padding: 0;
}
::v-deep(.buton-remove) {
  min-width: 1.5em;
  min-height: 1.53em;
}
::v-deep(.buton-less) {
  min-width: 1.5em;
  min-height: 1.53em;
}
::v-deep(.set-quantity--input .q-field__control) {
  align-self: center;
  margin: 0;
  min-height: 1.53em;
  width: 55px;
  height: 32px;
  max-height: 32px;
}
::v-deep(.set-quantity--input .q-field__native) {
  text-align: center;
}
::v-deep(.buton-add) {
  min-width: 1.5em;
  min-height: 1.53em;
}
.product-title {
  font-size: 14px;
  line-height: 15px;
  margin-top: 0;
  text-align: left;
}
.q-price {
  width: 100%;
  text-align: left;
}
.img_banner {
  width: 100%;
  height: auto;
  max-width: 900px;
}
</style>
