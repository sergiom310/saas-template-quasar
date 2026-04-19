<template>
  <div class="q-profile-settings">
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <q-tabs v-model="tab" vertical class="text-primary">
          <q-tab
            name="mails"
            icon="account_circle"
            :label="locale == 'es-CO' ? 'Cuenta' : 'Account'"
          />
          <q-tab name="alarms" icon="password" label="Password" />
          <q-tab
            name="movies"
            icon="security"
            :label="locale == 'es-CO' ? 'Seguridad' : 'Security'"
          />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel name="mails">
            <div class="text-h4 q-mb-md">{{ t('cuentatitle') }}</div>

            <q-form ref="formRef">
              <div style="display: grid; justify-content: center; margin: 20px auto">
                <q-avatar v-if="currentUser.photo" size="160px">
                  <img :src="urlRepo + currentUser.photo" />
                </q-avatar>
                <q-avatar v-else size="160px">
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                </q-avatar>

                <q-file
                  outlined
                  dense
                  clearable
                  accept="image/*"
                  v-model="editedItem.photo"
                  label="Upload Photo"
                  class="q-my-md"
                  ref="imagen"
                  @update:model-value="handleFileChange"
                />
              </div>

              <div class="row q-ma-md">
                <q-input
                  outlined
                  readonly
                  v-model="editedItem.email"
                  ref="email"
                  label="Email"
                  class="col"
                />
              </div>
              <div class="row q-ma-md">
                <div class="col-md-6 col-xs-12 q-px-xs">
                  <q-input
                    outlined
                    v-model="editedItem.name"
                    :rules="[(val) => !!val || 'Campo requerido']"
                    ref="name"
                    label="Nombre/Name"
                    class="col"
                  />
                </div>
                <div class="col-md-6 col-xs-12 q-px-xs">
                  <q-input
                    outlined
                    v-model="editedItem.username"
                    ref="username"
                    label="Username"
                    class="col"
                  />
                </div>
              </div>
              <div class="row q-ma-md">
                <div class="col-md-6 col-xs-12 q-px-xs">
                  <q-select
                    outlined
                    v-model="selectTipoDoc"
                    :options="tiposdoc"
                    :rules="[(val) => val.length > 0 || 'Campo requerido']"
                    ref="tipo_documento"
                    label="Tipo Documento/ID Type"
                    emit-value
                    class="col"
                  />
                </div>
                <div class="col-md-6 col-xs-12 q-px-xs">
                  <q-input
                    outlined
                    v-model="editedItem.documento"
                    :rules="[(val) => !!val || 'Campo requerido']"
                    ref="documento"
                    label="No. Documento/ID Number"
                    class="col"
                  />
                </div>
              </div>
              <div class="row q-ma-md">
                <q-input
                  outlined
                  v-model="editedItem.address"
                  ref="address"
                  label="Dirección/Address"
                  class="col"
                />
              </div>
              <div class="row q-ma-md">
                <q-input
                  outlined
                  v-model="editedItem.mobile"
                  ref="mobile"
                  label="Nº Celular/Phone Number"
                  class="col"
                />
              </div>
            </q-form>

            <q-btn label="Guardar" class="q-mt-md" color="primary" @click="save"></q-btn>
          </q-tab-panel>

          <q-tab-panel name="alarms">
            <div class="text-h4 q-mb-md">
              {{ locale == 'es-CO' ? 'Cambiar contraseña' : 'Change password' }}
            </div>

            <q-form ref="formRef2">
              <div class="row q-ma-md">
                <div class="col-md-6 col-xs-12 q-px-xs">
                  <q-input
                    outlined
                    v-model="editedItem2.password"
                    :rules="[
                      (val) => val.length > 0 || 'Campo requerido.',
                      (val) => val.length >= 8 || 'Ingrese al menos 8 caracteres.',
                    ]"
                    ref="password"
                    lazy-rules
                    :type="show1 ? 'password' : 'text'"
                    class="col"
                    label="Old Password"
                    stack-label
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
              </div>
              <div class="row q-ma-md">
                <div class="col-md-6 col-xs-12 q-px-xs">
                  <q-input
                    outlined
                    v-model="editedItem2.password2"
                    :rules="[
                      (val) => val.length > 0 || 'Campo requerido.',
                      (val) => val.length >= 8 || 'Ingrese al menos 8 caracteres.',
                      (val) =>
                        val !== editedItem2.password || 'Debe ser diferente del password anterior',
                    ]"
                    ref="password"
                    lazy-rules
                    :type="show2 ? 'password' : 'text'"
                    class="col"
                    label="New Password"
                    stack-label
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="show2 ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="show2 = !show2"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-md-6 col-xs-12 q-px-xs">
                  <q-input
                    outlined
                    v-model="editedItem2.password3"
                    :rules="[
                      (val) => val.length > 0 || 'Campo requerido.',
                      (val) => val.length >= 8 || 'Ingrese al menos 8 caracteres.',
                      (val) => val === editedItem2.password2 || 'Debe ser igual al nuevo password',
                    ]"
                    ref="password"
                    lazy-rules
                    :type="show3 ? 'password' : 'text'"
                    class="col"
                    label="Repeat Password"
                    stack-label
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="show3 ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="show3 = !show3"
                      />
                    </template>
                  </q-input>
                </div>

                <q-btn
                  :label="locale == 'es-CO' ? 'Modificar' : 'Modify'"
                  class="q-mt-md"
                  color="primary"
                  @click="save2"
                ></q-btn>
              </div>
            </q-form>
          </q-tab-panel>

          <q-tab-panel name="movies">
            <div class="text-h4 q-mb-md">
              {{ locale == 'es-CO' ? 'Usuario validado' : 'Validated user' }}
            </div>

            <q-badge
              v-if="currentUser.is_active"
              color="green"
              text-color="white"
              class="q-pa-md"
              :label="locale == 'es-CO' ? 'Usuario Validado' : 'User Valid'"
            />
            <q-badge
              v-else
              color="red"
              text-color="white"
              class="q-pa-md"
              :label="locale == 'es-CO' ? 'Usuario no Validado' : 'User not validated'"
            />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { showErrorMessage } from 'src/functions/function-show-error-message'
import { useAuthStore } from 'src/stores/auth'
import { apiBaseURL } from 'src/boot/api'

const urlRepo = `${apiBaseURL}/`

const authStore = useAuthStore()

const { currentUser, authError } = storeToRefs(authStore)
const { locale, t } = useI18n({ useScope: 'global' })

const tab = ref('mails')
const splitterModel = ref(20)
const formRef = ref(null)
const formRef2 = ref(null)
const show1 = ref(true)
const show2 = ref(true)
const show3 = ref(true)

const defaultItem = {
  id: '',
  email: '',
  name: '',
  username: '',
  tipo_documento: '',
  documento: '',
  address: '',
  mobile: '',
  photo: null,
}

const editedItem = ref({ ...defaultItem })

let editedItem2 = ref({
  id: currentUser.value.id,
  email: currentUser.value.email,
  password: '',
  password2: '',
  password3: '',
})

const selectTipoDoc = ref('')

const tiposdoc = [
  { value: 'Nit', label: 'Nit' },
  { value: 'Cédula', label: 'Cédula' },
  { value: 'Cédula de extranjería', label: 'Cédula de extranjería' },
  { value: 'Pasaporte', label: 'Pasaporte' },
]

const handleFileChange = (file) => {
  editedItem.value.photoFile = file || null;  
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  editedItem.value.tipo_documento = selectTipoDoc.value

  authStore.updateProfile(editedItem.value)
}

const save2 = async () => {
  const isValid = await formRef2.value.validate()
  if (!isValid) {
    return
  }

  const res = await authStore.updatePassword({current_password: editedItem2.value.password, new_password: editedItem2.value.password2})
  if (res) {
    editedItem2.value = {
      id: currentUser.value.id,
      email: currentUser.value.email,
      password: '',
      password2: '',
      password3: '',
    }
  } else {
    showErrorMessage(authError.value || 'Error al comprobar la actual contraseña')
  }
}
onMounted(() => {
  editedItem.value = {
    id: currentUser.value.id || '',
    name: currentUser.value.name || '',
    email: currentUser.value.email || '',
    username: currentUser.value.username || '',
    tipo_documento: currentUser.value.tipo_documento || '',
    documento: currentUser.value.documento || '',
    mobile: currentUser.value.mobile || '',
    address: currentUser.value.address || '',
  }
  selectTipoDoc.value = currentUser.value.tipo_documento
})
</script>
<style lang="scss" scoped>
.q-profile-settings {
  display: grid;
  width: 100%;
  margin: 50px auto;
  max-width: 900px;
}
</style>
