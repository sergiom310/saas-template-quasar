export default {
	methods: {
		submitForm() {
			this.$refs.modalPermissionName.$refs.name.validate()
			if (!this.$refs.modalPermissionName.$refs.name.hasError) {
				this.submitPermission()
			}
		}
	},
	components: {
		'modal-header': require('components/Shared/ModalHeader.vue').default,
		'modal-input-name': require('components/Shared/ModalInputName.vue').default,
		'modal-buttons': require('components/Shared/ModalButtons.vue').default,
	}
}