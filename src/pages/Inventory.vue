<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Inventaires</div>
          </q-toolbar-title>
          <q-btn
            v-if="hasRole('POST_INVENTORY')"
            label="Nouvel inventaire"
            class="float-right"
            color="blue-10"
            @click="recordToEdit=null; dialog = true"
            size="sm"
          />
        </q-toolbar>
      </q-header>

      <q-drawer
        side="right"
        v-model="drawerRight"
        bordered
        :width="600"
        :breakpoint="600"
        content-class="bg-grey-1"
      >
        <inventoryCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          :state="getState(recordToEdit.state_id)"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:validate="confirm= true"
        ></inventoryCard>
        <EmptyCard v-else></EmptyCard>
        <q-dialog v-model="confirm" persistent>
          <q-card>
            <q-card-section class="row">
              <span
                class="q-ml-sm"
              >Si vous validez l'inventaire, vous ne pourrez pas l'annuler, voulez vous vraiment valider cet inventaire ?</span>
            </q-card-section>
            <q-card-actions>
              <q-btn flat label="Annuler" color="grey-10" @click="confirm = false"/>
              <q-btn flat label="Confirmer" color="blue-10" @click="validateInventory()"/>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_INVENTORY')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="data"
            :filter="filter"
            :columns="columns"
            :loading="!fetched"
            row-key="row_key"
            selection="multiple"
            :selected.sync="selected"
            :selected-rows-label="getSelectedString"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-code="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.code || '---' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-state="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <q-badge
                  :color="getState(props.row.state_id).color"
                  text-color="white"
                  :label="getState(props.row.state_id).name"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-created_at="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption">{{ props.row.created_at || '---' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td
                auto-width
                style="border-right:4px solid #0d47a1"
                v-if="recordToEdit!==null && recordToEdit.id === props.row.id"
              >
                <q-btn
                  v-if="props.row.state_id === 1"
                  flat
                  round
                  class="bg-grey-2 q-pa-xs"
                  color="grey-6"
                  size="xs"
                >
                  <q-icon name="fas fa-trash" color="grey-9"/>
                </q-btn>
                <q-btn
                  flat
                  v-if="hasRole('PUT_INVENTORY') && props.row.state_id === 1"
                  round
                  class="q-ml-xs bg-grey-2 q-pa-xs"
                  color="grey-6"
                  size="xs"
                  @click="setRecordToEdit(props.row.id); dialog= true"
                >
                  <q-icon name="fas fa-pen" color="grey-9"/>
                </q-btn>
              </q-td>
              <q-td v-else></q-td>
            </template>
          </q-table>

          <inventoryComponent
            v-if="hasRole('POST_INVENTORY') || hasRole('PUT_INVENTORY')"
            :dialog="dialog"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></inventoryComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import inventoryComponent from 'components/inventoryComponent'
import inventoryCard from 'components/inventoryCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'InventoryPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      states: [],
      confirm: false,
      fetched: false,
      selected: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 20
      },
      filter: '',
      columns: [
        {
          name: 'code',
          required: true,
          label: 'Code',
          align: 'left',
          sortable: true
        },
        {
          name: 'state',
          required: true,
          label: 'Etat',
          align: 'left',
          sortable: true
        },
        {
          name: 'created_at',
          label: "Date d'inventaire",
          required: true,
          align: 'left',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          required: true
        }
      ]
    }
  },
  components: {
    inventoryComponent,
    inventoryCard,
    EmptyCard
  },
  mounted () {
    this.getStates()
    this.getInventories()
  },
  methods: {
    getState (stateId) {
      return this.states.find(el => el.id === stateId)
    },
    getStates () {
      this.$axios.get('/state').then(res => {
        this.states = res.data
      })
    },
    getInventories () {
      this.$axios.get('/inventory').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },
    updateTableRows (data) {
      if (this.recordToEdit === null) {
        this.data.unshift(data)
      } else {
        const index = this.data.findIndex(el => el.id === data.id)
        if (index !== -1) {
          this.data.splice(index, 1, data)
        }
      }
      this.dialog = false
    },
    setRecordToEdit (id) {
      if (this.recordToEdit === null || this.dialog === true ||
      parseInt(this.recordToEdit.id) !== parseInt(id)) {
        this.$axios.get('inventory/' + id)
          .then(res => {
            this.recordToEdit = res.data
          })
      }
    },
    getSelectedString () {
      return this.selected.length === 0
        ? ''
        : `${this.selected.length} ligne${
            this.selected.length > 1 ? 's' : ''
          } selectionné${this.selected.length > 1 ? 's' : ''} de ${
            this.data.length
          }`
    },
    addRowToSelected (row) {
      const i = this.selected.findIndex(el => el.id === row.id)

      if (i === -1) {
        this.selected.push(row)
      } else {
        this.selected.splice(i, 1)
      }
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    },
    validateInventory () {
      if (this.recordToEdit !== null) {
        const id = this.recordToEdit.id
        const data = new FormData()
        data.append('_method', 'PUT')
        this.$axios
          .post('validateInventory/' + id, data)
          .then(res => {
            const i = this.data.findIndex(
              el => parseInt(el.id) === parseInt(id)
            )
            if (i !== -1) {
              this.data[i].state_id = 2
              this.data[i].code = res.data
            }
            this.confirm = false
            this.$q.notify({
              color: 'blue-10',
              message: "L'inventaire a été validé avec succés"
            })
          })
          .catch(err => {
            this.confirm = false
            let message = ''

            if (err.response.status === 401) {
              message =
                "Accés non autorisé, vous n'avez pas la permission pour effectuer cette operation"
            } else if (err.response && err.response.data) {
              message = err.response.data.message
            }
            this.$q.notify({
              type: 'negative',
              message: message
            })
          })
      } else {
        this.confirm = false
      }
    }
  }
}
</script>
