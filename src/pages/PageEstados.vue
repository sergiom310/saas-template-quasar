<template>
  <q-page padding>
    <q-toolbar class="bg-primary text-white">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Estados </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :data="tiposEstados"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filter"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
            <template v-slot:append>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-action="cellProperties">
          <q-td :props="cellProperties">
            <q-btn
              icon="edit"
              color="primary"
              @click.stop="showEditModal(cellProperties.row)"
              v-if="laravelCan('admin.update')"
              flat
              dense
            ></q-btn>
            <q-btn
              icon="delete"
              color="red"
              @click.stop="deleteItem(cellProperties.row.id)"
              v-if="laravelCan('admin.destroy')"
              flat
              dense
            ></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <div
      class="absolute-bottom text-center q-mb-lg no-pointer-events"
      v-if="laravelCan('admin.create')"
    >
      <q-btn
        @click.stop="dialog = true"
        round
        class="all-pointer-events"
        color="primary"
        size="18px"
        icon="add"
      />
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 480px; max-width: 580px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <form @submit.prevent="submitForm">
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.nom_estado"
              :rules="[(val) => !!val || 'Field is required']"
              ref="nom_estado"
              label="Nombre estado"
              class="col"
            >
            </q-input>
          </div>
        </form>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="close"></q-btn>
          <q-btn flat label="Guardar" color="primary" @click="save"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { laravelCan } from 'src/functions/function-general'
import { mapActions, mapState } from 'vuex'

export default {
  data() {
    return {
      dialog: false,
      editCreate: false,
      defaultItem: {
        id: '',
        nom_estado: '',
      },
      editedItem: {
        id: '',
        nom_estado: '',
      },
      filter: '',
      pagination: {
        sortBy: 'id',
        descending: false,
        page: 1,
        rowsPerPage: 7,
        //rowsNumber:
      },
      columns: [
        { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
        { name: 'name', align: 'left', label: 'Nombre', field: 'nom_estado', sortable: true },
        {
          name: 'nom_estado',
          align: 'left',
          label: 'Status',
          field: 'nom_estado2',
          sortable: true,
        },
        { name: 'action', align: 'center', label: 'Action' },
      ],
    }
  },

  methods: {
    laravelCan,
    ...mapActions('estados', ['loadEstados', 'addEstado', 'updateEstado', 'deleteEstado']),

    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editCreate = false
      }, 200)
    },

    save() {
      this.$refs.nom_estado.validate()
      if (this.$refs.nom_estado.hasError) {
        return
      }
      if (this.editCreate) {
        this.updateEstado(this.editedItem)
      } else {
        this.addEstado(this.editedItem)
      }
      this.close()
    },

    showEditModal(item) {
      // asigno al la variable del estado que contiene el id y nombre del role a editar
      this.editedItem = Object.assign({}, item)
      // variable que me dice si estoy editando o creando
      this.editCreate = true
      setTimeout(() => {
        this.dialog = true
      }, 200)
    },

    deleteItem(item) {
      this.$q
        .dialog({
          title: 'Confirmar',
          message: 'Realmente desea eliminar el item?',
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          // send request to server
          this.deleteEstado(item)
        })
    },
  },

  computed: {
    ...mapState('estados', ['tiposEstados']),
    formTitle() {
      return this.editCreate ? 'Editar' : 'Incluir'
    },
  },

  created() {
    if (!this.laravelCan('admin.index')) {
      this.$router.push({ path: '/dashboard' })
    } else {
      this.loadEstados()
    }
  },
}
</script>
