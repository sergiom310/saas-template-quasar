<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated style="background: var(--header-bg); color: var(--header-text)">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-btn id="btn-home" dense flat round icon="home" :to="isLandlord ? '/home' : (isLoggedIn ? '/dashboard' : '/')" />

        <q-space />

        <q-btn
          dense
          flat
          round
          @click="changeDarkMode"
          icon="contrast"
          class="justify-end q-mr-xs"
          title="Dark Mode"
        />

        <q-btn v-if="isLoggedIn && !isLandlord" dense flat round icon="shopping_cart" class="justify-end q-pr-xs" @click="gotoCart">
          <q-badge color="accent" text-color="white" floating>{{ totalItems }}</q-badge>
        </q-btn>        


      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" overlay :breakpoint="767" :width="300" elevated>
      <q-list style="height: 100%; display: flex; flex-direction: column;">

        <div style="flex: 1; overflow-y: auto;">
          <!-- Items exclusivos para usuarios logueados -->
          <template v-if="isLoggedIn">
            <q-item v-if="laravelCan('system.index')" to="/dashboard">
              <q-item-section avatar>
                <q-icon name="domain" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dashboard</q-item-label>
              </q-item-section>
            </q-item>
            <q-expansion-item
              v-if="laravelCan('system.index')"
              expand-separator
              icon="settings"
              label="System"
            >
              <q-expansion-item
                :header-inset-level="0.5"
                expand-separator
                icon="receipt"
                label="Usuarios y Permisos"
              >
                <q-item to="/system/permissions" :inset-level="1" exact clickable>
                  <q-item-section avatar>
                    <q-icon name="perm_data_setting" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Permisos</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item to="/system/roles" :inset-level="1" exact clickable>
                  <q-item-section avatar>
                    <q-icon name="supervised_user_circle" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Roles</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item to="/system/users" :inset-level="1" exact clickable>
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Usuarios</q-item-label>
                  </q-item-section>
                </q-item>

              </q-expansion-item>

              <q-item to="/system/tenants" :inset-level="0.5" exact clickable>
                <q-item-section avatar>
                  <q-icon name="business" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Tenants</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/system/pagos" :inset-level="0.5" exact clickable>
                <q-item-section avatar>
                  <q-icon name="currency_exchange" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Pagos</q-item-label>
                </q-item-section>
              </q-item>

            </q-expansion-item>
          </template>

          <!-- Menú Tienda: visible para tenants, logueado o no -->
          <template v-if="!isLandlord">
            <q-item to="/" exact clickable>
              <q-item-section avatar>
                <q-icon name="storefront" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Tienda</q-item-label>
              </q-item-section>
            </q-item>

            <q-expansion-item
              v-if="categoriesHome.length > 0"
              expand-separator
              icon="shopping_cart"
              label="Categorías"
            >
              <div v-for="category in categoriesHome" :key="category.id">
                <div v-if="category.subCategories.length > 0">
                  <q-expansion-item :header-inset-level="0.5">
                    <template v-slot:header>
                      <q-item-section avatar>
                        <q-avatar>
                          <img :src="isImagen(category.imagen)" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section v-if="locale == 'es-CO'">{{ category.name }}</q-item-section>
                      <q-item-section v-if="locale == 'en-US'">{{ category.name_en }}</q-item-section>
                    </template>
                    <q-item
                      v-for="item in category.subCategories"
                      :key="item.id"
                      :to="'/products/' + item.slug"
                      :inset-level="1"
                      exact
                      clickable
                    >
                      <q-item-section avatar>
                        <q-avatar>
                          <img v-if="item.imagen" :src="isImagen(item.imagen)" />
                          <img v-else src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.name }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-expansion-item>
                </div>
                <div v-else>
                  <q-item :to="'/products/' + category.slug" :inset-level="0.5" exact clickable>
                    <q-item-section avatar>
                      <q-avatar>
                        <img v-if="category.imagen" :src="isImagen(category.imagen)" />
                        <img v-else src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label v-if="locale == 'es-CO'">{{ category.name }}</q-item-label>
                      <q-item-label v-if="locale == 'en-US'">{{ category.name_en }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </q-expansion-item>

            <q-expansion-item
              v-if="laravelCan('admin.index')"
              expand-separator
              icon="settings"
              label="Administración"
            >
              <q-item
                to="/tienda/marcas"
                v-if="laravelCan('admin.create')"
                :inset-level="0.5"
                exact
                clickable
              >
                <q-item-section avatar>
                  <q-icon name="domain" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Marcas</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                to="/tienda/categories"
                v-if="laravelCan('admin.create')"
                :inset-level="0.5"
                exact
                clickable
              >
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Categorías</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                to="/tienda/tags"
                v-if="laravelCan('admin.create')"
                :inset-level="0.5"
                exact
                clickable
              >
                <q-item-section avatar>
                  <q-icon name="tag" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Etiquetas</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                to="/tienda/products"
                v-if="laravelCan('admin.create')"
                :inset-level="0.5"
                exact
                clickable
              >
                <q-item-section avatar>
                  <q-icon name="inventory_2" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Productos</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                to="/tienda/metodos-pagos"
                v-if="laravelCan('admin.create')"
                :inset-level="0.5"
                exact
                clickable
              >
                <q-item-section avatar>
                  <q-icon name="payment" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Métodos de Pago</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                to="/tienda/empresa"
                v-if="laravelCan('admin.create')"
                :inset-level="0.5"
                exact
                clickable
              >
                <q-item-section avatar>
                  <q-icon name="business" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Mi Empresa</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/ventas" :inset-level="0.5" exact clickable>
                <q-item-section avatar>
                  <q-icon name="receipt_long" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Ventas</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/tienda/ordenes" :inset-level="0.5" exact clickable v-if="laravelCan('admin.create')">
                <q-item-section avatar>
                  <q-icon name="list_alt" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Órdenes</q-item-label>
                </q-item-section>
              </q-item>
            </q-expansion-item>
          </template>

        </div>

        <q-item v-if="!isLoggedIn" clickable v-ripple @click="goToAuth" style="margin-top: auto;">
          <q-item-section avatar>
            <q-icon name="account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Acceso</q-item-label>
          </q-item-section>
        </q-item>

        <div v-if="isLoggedIn" style="margin-top: auto;">
          <q-separator inset class="q-my-sm" />

          <q-item clickable v-ripple @click="goProfile" class="q-py-sm">
            <q-item-section avatar>
              <q-avatar v-if="currentUser && currentUser.photo" size="40px">
                <img :src="urlRepo + currentUser.photo" />
              </q-avatar>
              <q-avatar v-else size="40px">
                <img src="https://cdn.quasar.dev/img/boy-avatar.png" size="40px"/>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ nameCurrentUser }}</q-item-label>
              <q-item-label caption>{{ currentUser && currentRoleUser ? currentRoleUser.role : 'Invitado' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="handleLogout" class="text-negative">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Cerrar Sesión</q-item-label>
            </q-item-section>
          </q-item>
        </div>

      </q-list>
    </q-drawer>

    <q-footer elevated style="background: var(--header-bg); color: var(--header-text)">
      <q-tabs inline-label>
        <q-route-tab
          v-for="nav in navs"
          :key="nav.label"
          :to="nav.to"
          :icon="nav.icon"
          :label="nav.label"
        />
      </q-tabs>
    </q-footer>

    <q-page-container class="scroll-container" @click="closeDrawerOnDesktop">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import { useI18nStore } from 'src/stores/i18nStore'
import { useCategoryStore } from 'src/stores/category'
import { useQuasar } from 'quasar'
import { laravelCan } from 'src/functions/function-general'
import { useRouter } from 'vue-router'
import { useRecaptchaRouteHandler } from 'src/composables/useRecaptcha'
import { useCartStore } from 'src/stores/shoppingCart'
import { apiBaseURL } from 'src/boot/api'

const i18nStore = useI18nStore()
const { locale: storeLocale } = storeToRefs(i18nStore)
const { locale, t } = useI18n({ useScope: 'global' })

const urlRepo = `${apiBaseURL}/`
const authStore = useAuthStore()
const { isLoggedIn, currentUser, currentRoleUser } = storeToRefs(authStore)
const categoryStore = useCategoryStore()
const { categoriesHome } = storeToRefs(categoryStore)

const cartStore = useCartStore()
const { totalItems } = storeToRefs(cartStore)

const router = useRouter()
const $q = useQuasar()

// Manejar reCAPTCHA basado en la ruta actual
useRecaptchaRouteHandler()

const leftDrawerOpen = ref(false)

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const isImagen = (imagen) => {
  if (imagen != null) {
    return urlRepo + imagen
  } else {
    return 'statics/item-menu-default.png'
  }
}

const goProfile = () => {
  if (currentUser.value) {
    router.push('/profileuser')
  }
}

const goToAuth = () => {
  router.push('/auth')
}

const gotoCart = () => {
  if (totalItems.value > 0) {
    router.push('/cartlist')
  }
}

const handleLogout = () => {
  authStore.logoutUser(router)
}

const changeDarkMode = () => {
  $q.dark.set(!$q.dark.isActive)
}

const closeDrawerOnDesktop = () => {
  if ($q.screen.width >= 767 && leftDrawerOpen.value) {
    leftDrawerOpen.value = false
  }
}

const nameCurrentUser = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name.length > 20
      ? currentUser.value.name.substring(0, 20)
      : currentUser.value.name
  }
  return 'Usuario Invitado'
})

// Detectar si estamos en el dominio landlord (principal) o en un tenant (subdominio)
const isLandlord = computed(() => {
  const hostname = window.location.hostname
  return hostname === 'localhost'
})

// Watcher para cambios en el tamaño de pantalla eliminado — el drawer solo responde al botón burger

onMounted(() => {
  locale.value = storeLocale.value
  categoryStore.loadCategoryHome()
})

const navs = computed(() => [
  { label: t('lyUs'), icon: 'home_work', to: '/about' },
  { label: t('lyContact'), icon: 'info', to: '/contact' },
])
</script>

<style scoped lang="scss">
.hide-small {
  display: none;

  @media screen and (min-width: 768px) {
    display: block;
  }
}

@media screen and (min-width: 768px) {
  /*.q-footer {
      display: none;
    }*/
}
.scroll-container {
  overflow-y: auto;
  max-height: 100vh;
}
// @media screen and (max-width: 768px) {
//   #btn-home {
//       display: none;
//   }
// }

.q-buton:nth-child(3) {
  margin: 0 3px;
}

.platform-ios {
  .q-header {
    padding-top: constant(safe-area-inset-top);
    padding-top: env(safe-area-inset-top);
  }
  .p-footer {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
