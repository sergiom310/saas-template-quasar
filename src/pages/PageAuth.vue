<template>
  <q-page padding>
    <q-card class="auth-tabs">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="login" label="Login" />
        <q-tab v-if="isMainDomain" name="register" label="Register" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="login">
          <login-register :tab="tab" @registration-success="handleRegistrationSuccess" />
        </q-tab-panel>

        <q-tab-panel v-if="isMainDomain" name="register">
          <login-register :tab="tab" @registration-success="handleRegistrationSuccess" />
          <!--v-bind:tab.sync="tab" -->
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script>
import LoginRegister from 'components/Auth/LoginRegister.vue'

export default {
  data() {
    return {
      tab: 'login',
    }
  },
  components: {
    LoginRegister,
  },
  computed: {
    isMainDomain() {
      // Detectar si estamos en el dominio principal (sin subdominio de tenant)
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === 'agendas.grupoados.com' || 
             hostname === 'agendas.local' ||
             hostname.split('.').length <= 2;
    }
  },
  methods: {
    handleRegistrationSuccess() {
      // Cambiar automáticamente a la pestaña de login después del registro exitoso
      setTimeout(() => {
        this.tab = 'login'
      }, 1000) // Pequeño delay para que el usuario vea la notificación
    }
  }
}
</script>

<style>
.auth-tabs {
  max-width: 500px;
  margin: 0 auto;
}
</style>
