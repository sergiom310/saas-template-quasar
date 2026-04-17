<template>
  <q-card>
    <modal-header>Add Permission</modal-header>

    <form @submit.prevent="submitForm">
      <q-card-section>
        <modal-input-name v-model.propName="permissionToSubmit.name" ref="modalPermissionName" />
      </q-card-section>

      <modal-buttons></modal-buttons>
    </form>
  </q-card>
</template>

<script>
import { mapActions } from 'vuex'
import mixinAddEditPermission from 'src/mixins/mixin-add-edit-permission'

export default {
  mixins: [mixinAddEditPermission],
  data() {
    return {
      permissionToSubmit: {
        name: '',
      },
    }
  },
  methods: {
    ...mapActions('permissions', ['addPermission']),
    submitPermission() {
      this.addPermission(this.permissionToSubmit)
      this.$emit('close')
    },
  },
}
</script>
