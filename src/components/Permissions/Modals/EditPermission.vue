<template>
  <q-card>
    <modal-header>Edit Permission</modal-header>

    <form @submit.prevent="submitForm">
      <q-card-section>
        <modal-input-name v-model.propName="permissionToSubmit.name" ref="modalPermissionName" />
      </q-card-section>

      <modal-buttons></modal-buttons>
    </form>
  </q-card>
</template>

<script>
import { mapActions, mapState } from 'vuex'
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
    ...mapActions('permissions', ['updatePermission']),
    ...mapState('permissions', ['permissionToEdit']),
    submitPermission() {
      this.updatePermission({
        id: this.permissionToEdit().id,
        name: this.permissionToSubmit.name,
      })
      this.$emit('close')
    },
  },
  mounted() {
    this.permissionToSubmit.name = this.permissionToEdit().name
  },
}
</script>
