<template>
	<div class="row q-mb-sm">
	<q-input
		outlined
		:value="name"
		@input="$emit('update:name', $event)"
		:rules="[val => !!val || 'Field is required']"
        v-autofocus="{ delayCordova: 700 }"
		v-select-all
		ref="name"
		label="Name"
		class="col">
			<template v-slot:append>
		<q-icon
			v-if="name"
			@click="$emit('update:name', '')"
			name="close"
			class="cursor-pointer" />
	  </template>
	</q-input>
	</div>
</template>

<script>
	import { selectAll } from 'src/directives/directive-select-all'
    import { autofocus } from 'src/directives/directive-autofocus'

	export default {
		props: ['name'],
		directives: {
			selectAll,
            autofocus
		}
	}
</script>