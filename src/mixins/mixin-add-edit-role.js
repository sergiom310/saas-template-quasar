export default {
	methods: {
		submitForm() {
			this.$refs.modalRoleName.$refs.name.validate()
			if (!this.$refs.modalRoleName.$refs.name.hasError) {
				this.submitRole()
			}
		}
	},
	components: {
		'modal-header': require('components/Shared/ModalHeader.vue').default,
		'modal-input-name': require('components/Shared/ModalInputName.vue').default,
		'modal-buttons': require('components/Shared/ModalButtons.vue').default,
	}
}