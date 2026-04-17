<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleDrawer" />
        <q-btn id="btn-home" dense flat round icon="home" to="/home" />

        <q-space />

        <q-btn
          dense
          flat
          round
          color="white"
          @click="changeDarkMode"
          icon="contrast"
          class="justify-end q-mr-xs"
          title="Dark Mode"
        />

        <q-btn v-if="isLoggedIn && !isLandlord && hasModulo('agendas')" dense flat round icon="shopping_cart" class="justify-end q-pr-xs" @click="gotoCart">
          <q-badge color="accent" text-color="white" floating>{{ totalItems }}</q-badge>
        </q-btn>        

        <q-btn
          v-if="!isLoggedIn"
          @click="goToAuth"
          flat
          icon-right="account_circle"
          label="Acceso"
          class="justify-end"
        />
        <q-btn v-else @click="handleLogout" flat icon-right="logout" class="justify-end" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" :breakpoint="767" :width="300" bordered>
      <q-list class="text-grey-8">
        <div class="avatar-style">
          <q-item clickable v-ripple @click="goProfile">
            <q-item-section avatar>
              <q-avatar v-if="currentUser && currentUser.photo" size="60px">
                <img :src="urlRepo + currentUser.photo" />
              </q-avatar>
              <q-avatar v-else size="60px">
                <q-icon name="account_circle" size="1.5em" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              {{ nameCurrentUser }}
              <q-item-label caption lines="1">{{
                currentUser && currentRoleUser ? currentRoleUser.role : 'Invitado'
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>

        <q-separator></q-separator>

        <div v-if="isLoggedIn">
          <q-item v-if="isLoggedIn && laravelCan('system.index')" to="/dashboard">
            <q-item-section avatar>
              <q-icon name="domain" color="primary" />
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
                  <q-icon name="perm_data_setting" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Permisos</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/system/roles" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="supervised_user_circle" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Roles</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/system/users" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Usuarios</q-item-label>
                </q-item-section>
              </q-item>

            </q-expansion-item>

            <q-item to="/system/tenants" :inset-level="0.5" exact clickable>
              <q-item-section avatar>
                <q-icon name="business" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Tenants</q-item-label>
              </q-item-section>
            </q-item>

            <q-item to="/system/modulos" :inset-level="0.5" exact clickable>
              <q-item-section avatar>
                <q-icon name="view_module" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Módulos</q-item-label>
              </q-item-section>
            </q-item>
            
            <q-item to="/system/pagos" :inset-level="0.5" exact clickable>
              <q-item-section avatar>
                <q-icon name="currency_exchange" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Pagos</q-item-label>
              </q-item-section>
            </q-item>

            <q-item to="/system/bitacora" :inset-level="0.5" exact clickable>
              <q-item-section>
                <q-item-label>Bitácora</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- Menú Agenda solo visible para tenants (NO para landlord/admin) -->
          <q-expansion-item
            v-if="!isLandlord && hasModulo('agendas')"
            expand-separator
            icon="event"
            label="Agenda"
          >
            <q-expansion-item
              expand-separator
              icon="settings"
              label="Configuración"
              :header-inset-level="0.5"
            >
              <q-item to="/agenda/especialidades" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="medical_services" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Especialidades</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/agenda/profesionales" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="badge" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Profesionales</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item to="/agenda/MetodosPagos" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="payment" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Medios de Pagos</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/agenda/franjas-horarias" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="access_time" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Franjas Horarias</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item to="/agenda/clientes" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Clientes Agenda</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/agenda/mis-pagos" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="payment" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Mis Pagos</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-expansion-item
                v-if="laravelCan('admin.index')"
                expand-separator
                icon="store"
                label="Admin. Ventas"
                caption=""
                :header-inset-level="0.5"
                default-closed
              >
                <q-item
                  to="/agendas/marcas"
                  v-if="laravelCan('admin.create')"
                  :inset-level="1.5"
                  exact
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name="domain" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Marcas</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  to="/agendas/categories"
                  v-if="laravelCan('admin.create')"
                  :inset-level="1.5"
                  exact
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name="category" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Categorias</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  to="/agendas/tags"
                  v-if="laravelCan('admin.create')"
                  :inset-level="1.5"
                  exact
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name="tag" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Etiquetas</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  to="/agendas/products"
                  v-if="laravelCan('admin.create')"
                  :inset-level="1.5"
                  exact
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name="article" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Productos</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item to="/agendas/mis-ventas" :inset-level="1.5" exact clickable>
                  <q-item-section avatar>
                    <q-icon name="payment" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Mis Ventas</q-item-label>
                  </q-item-section>
                </q-item>
                
              </q-expansion-item>              
            </q-expansion-item>

            <q-item to="/agenda/agendar" :inset-level="0.5" exact clickable>
              <q-item-section avatar>
                <q-icon name="event_available" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Agendar</q-item-label>
              </q-item-section>
            </q-item>

            <q-item to="/calendario" :inset-level="0.5" exact clickable>
              <q-item-section avatar>
                <q-icon name="calendar_month" color="info" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Calendario</q-item-label>
              </q-item-section>
            </q-item>

            <q-item to="/pagos" :inset-level="0.5" exact clickable>
              <q-item-section avatar>
                <q-icon name="payments" color="positive" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Pagos</q-item-label>
              </q-item-section>
            </q-item>
              <q-item to="/gastos" :inset-level="0.5" exact clickable>
                <q-item-section avatar>
                  <q-icon name="money_off" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Gastos</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/reportes" :inset-level="0.5" exact clickable>
                <q-item-section avatar>
                  <q-icon name="assessment" color="purple" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Reportes</q-item-label>
                </q-item-section>
              </q-item>

            <q-expansion-item
              v-if="categoriesHome.length > 0"
              expand-separator
              icon="shopping_cart"
              label="Productos"
              :header-inset-level="0.5"
            >
              <div v-for="category in categoriesHome" :key="category.id">
                <div v-if="category.subCategories.length > 0">
                  <q-expansion-item :header-inset-level="1">
                    <template v-slot:header>
                      <q-item-section avatar>
                        <q-avatar>
                          <img :src="isImagen(category.imagen)" />
                        </q-avatar>
                      </q-item-section>

                      <q-item-section v-if="locale == 'es-CO'">
                        {{ category.name }}
                      </q-item-section>
                      <q-item-section v-if="locale == 'en-US'">
                        {{ category.name_en }}
                      </q-item-section>
                    </template>

                    <q-item
                      v-for="item in category.subCategories"
                      :key="item.id"
                      :to="'/products/' + item.slug"
                      :inset-level="1.5"
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
                  <q-item :to="'/products/' + category.slug" :inset-level="1" exact clickable>
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
              
          </q-expansion-item>

          <!-- Menú Parqueaderos solo visible para tenants (NO para landlord/admin) -->
          <q-expansion-item
            v-if="!isLandlord && hasModulo('parking')"
            expand-separator
            icon="local_parking"
            label="Parqueaderos"
          >
            <q-expansion-item
              v-if="laravelCan('admin.index')"
              :header-inset-level="0.5"
              expand-separator
              icon="settings"
              label="Configuración"
            >
              <q-item to="/parqueaderos/TipoVehiculos" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="directions_car" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Tipos de Vehículos</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/parqueaderos/Tarifas" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="toll" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Tarifas</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/parqueaderos/ReglasTarifas" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="rule" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Reglas Tarifas</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/parqueaderos/MetodosPagos" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="payment" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Medios de Pagos</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/parqueaderos/empresa-config" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="business" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Configuración Empresa</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/parqueaderos/configuraciones-generales" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="settings" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Configuraciones Generales</q-item-label>
                </q-item-section>
              </q-item>
              <q-item to="/system/users" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Usuarios</q-item-label>
                </q-item-section>                
              </q-item>
              <q-item to="/parqueaderos/mis-pagos" :inset-level="1" exact clickable>
                <q-item-section avatar>
                  <q-icon name="payment" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Mis Pagos</q-item-label>
                </q-item-section>
              </q-item>

            </q-expansion-item>
              <q-expansion-item
            expand-separator
            icon="receipt_long"
            label="Mensualidades"
            :header-inset-level="0.5"
          >
            <q-item to="/mensualidades/clientes" :inset-level="1" exact clickable>
              <q-item-section avatar>
                <q-icon name="people" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Clientes</q-item-label>
              </q-item-section>
            </q-item>
            <q-item to="/mensualidades/pagos" :inset-level="1" exact clickable>
              <q-item-section avatar>
                <q-icon name="payment" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Pagos</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>


            <q-item to="/parqueaderos/registro-entrada" :inset-level="0" exact clickable>
              <q-item-section avatar>
                <q-icon name="input" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Registro Entradas/Salidas</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="laravelCan('admin.index')" to="/parqueaderos/reportes-sistema" :inset-level="0" exact clickable>
              <q-item-section avatar>
                <q-icon name="analytics" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Reportes del sistema</q-item-label>
              </q-item-section>
            </q-item>

            <q-item to="/parqueaderos/reportes-usuario" :inset-level="0" exact clickable>
              <q-item-section avatar>
                <q-icon name="person_search" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Reportes de Usuario</q-item-label>
              </q-item-section>
            </q-item>

            <q-item to="/parqueaderos/cuadre-caja" :inset-level="0" exact clickable>
              <q-item-section avatar>
                <q-icon name="payments" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cuadre de caja</q-item-label>
              </q-item-section>
            </q-item>

          </q-expansion-item>
          
        </div>
      </q-list>
    </q-drawer>

    <q-footer>
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

    <q-page-container class="scroll-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import { useI18nStore } from 'src/stores/i18nStore'
import { useCategoryStore } from 'src/stores/category'
import { useQuasar } from 'quasar'
import { laravelCan } from 'src/functions/function-general'
import { useRouter } from 'vue-router'
import { useRecaptchaRouteHandler } from 'src/composables/useRecaptcha'
import { useCartStore } from 'src/stores/shoppingCart'

const i18nStore = useI18nStore()
const { locale: storeLocale } = storeToRefs(i18nStore)
const { locale, t } = useI18n({ useScope: 'global' })

const urlRepo = `${import.meta.env.VITE_API_URL}/`
const authStore = useAuthStore()
const { isLoggedIn, currentUser, currentRoleUser, hasModulo } = storeToRefs(authStore)
const categoryStore = useCategoryStore()
const { categoriesHome } = storeToRefs(categoryStore)

const cartStore = useCartStore()
const { totalItems } = storeToRefs(cartStore)

const router = useRouter()
const $q = useQuasar()

// Manejar reCAPTCHA basado en la ruta actual
useRecaptchaRouteHandler()

const leftDrawerOpen = ref(false)

// Función para determinar si estamos en desktop
const isDesktop = () => {
  return $q.screen.width >= 1200 // Desktop a partir de 1200px
}

// Inicializar el estado del drawer basado en el tamaño de pantalla
const initializeDrawerState = () => {
  leftDrawerOpen.value = isDesktop()
}

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
  // Es landlord si estamos en el dominio principal sin subdominio de cliente
  return hostname === 'localhost' || 
         hostname === 'agendas.grupoados.com' || 
         hostname === 'agendas.local'
})

// Watcher para cambios en el tamaño de pantalla
watch(() => $q.screen.width, (newWidth) => {
  leftDrawerOpen.value = newWidth >= 1200
})

onMounted(() => {
  locale.value = storeLocale.value
  categoryStore.loadCategoryHome()
  initializeDrawerState()
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
.avatar-style {
  background: url('https://cdn.quasar.dev/img/material.png');
  height: auto;
  background-size: cover;

  .q-item__section {
    font-weight: bold;
    color: #ffffff;
  }
  .q-item__label {
    font-weight: bold;
    color: #fefefe;
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

.q-drawer {
  .q-router-link--exact-active {
    color: gray !important;
    font-weight: bold;
  }
}

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
