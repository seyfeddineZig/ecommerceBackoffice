<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Clients</div>
          </q-toolbar-title>
          <!-- <q-btn
            v-if="hasRole('POST_CUSTOMER')"
            label="Nouvelle catégorie"
            color="blue-10"
            @click="recordToEdit=null; dialog = true"
            size="sm"
          /> -->
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
        <CustomerCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          v-on:setState="setState"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:deleteImage="deleteImage(recordToEdit.id)"
        ></CustomerCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page>
          <q-table
            v-if="hasRole('GET_CUSTOMER')"
            class="my-sticky-header-table no-border no-shadow"
            title=""
            :pagination="initialPagination"
            :data="data"
            :filter="filter"
            :columns="columns"
            row-key="row_key"
            :loading="!fetched"

            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-avatar="props">
              <q-td auto-width @click="setRecordToEdit(props.row.id);">
                <q-avatar color="blue-10" size="lg">
                  <img
                    v-if="props.row.image"
                    :src="$axios.defaults.baseURL.replace('api', 'images') + props.row.image"
                  >
                  <div v-else class="text-subtitle1 text-white">{{ props.row.last_name[0] }}</div>
                </q-avatar>
              </q-td>
            </template>
            <template v-slot:body-cell-name="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.last_name + ' ' + props.row.first_name }}</div>
                <div class="text-caption text-grey-6">{{ props.row.email }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-state="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <q-badge :color="getState(props.row.state_id).color" text-color="white" :label="getState(props.row.state_id).name" />
              </q-td>
            </template>
              <template v-slot:body-cell-points="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-blue-10 text-weight-bold text-h5">
                  {{ props.row.points }}
                </div>
              </q-td>
            </template>
            <!--<template v-slot:body-cell-actions="props">
              <q-td
                auto-width
                style="border-right:4px solid #0d47a1"
                v-if="recordToEdit!==null && recordToEdit.id === props.row.id"
              >
                <q-btn flat round class="bg-grey-2 q-pa-xs" color="grey-6" size="xs">
                  <q-icon name="fas fa-trash" color="grey-9"/>
                </q-btn>
                 <q-btn
                  flat
                  round
                  class="q-ml-xs bg-grey-2 q-pa-xs"
                  color="grey-6"
                  size="xs"
                  @click=" dialog= true; setRecordToEdit(props.row.id)"
                >
                  <q-icon name="fas fa-pen" color="grey-9"/>
                </q-btn>
              </q-td>
              <q-td v-else></q-td>
            </template>
            -->
          </q-table>
          <!-- <CustomerComponent
            v-if="hasRole('POST_CUSTOMER') || hasRole('PUT_CUSTOMER')"
            :dialog="dialog"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></CustomerComponent> -->
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
// import CustomerComponent from 'components/CustomerComponent'
import CustomerCard from 'components/CustomerCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'CustomerPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      states: [],
      selected: [],
      fetched: false,
      initialPagination: {
        page: 1,
        rowsPerPage: 20
      },
      filter: '',
      columns: [
        {
          name: 'avatar',
          label: ' ',
          required: true
        },
        {
          name: 'name',
          required: true,
          label: 'Nom',
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
          name: 'points',
          required: true,
          label: 'Points',
          align: 'left',
          sortable: true
        }
        /* {
          name: 'actions',
          label: 'Actions',
          required: true
        } */
      ]
    }
  },
  components: {
    // CustomerComponent,
    CustomerCard,
    EmptyCard
  },
  mounted () {
    this.getCustomers()
    this.getStates()
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
    getCustomers () {
      this.$axios.get('/customer').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },
    updateTableRows (data) {
      const index = this.data.findIndex(
        e => e.id === data.id
      )
      if (index !== -1) {
        this.data.splice(index, 1, data)
      } else {
        this.data.push(data)
      }

      this.setRecordToEdit(data.id)
      this.dialog = false
    },
    setRecordToEdit (id) {
      if (this.recordToEdit === null || this.dialog === true ||
      parseInt(this.recordToEdit.id) !== parseInt(id)) {
        this.$axios.get('customer/' + id)
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
    deleteImage (id) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      const data = new FormData()

      data.append('_method', 'PUT')
      data.append('delete_image', true)

      this.$axios.post('customer/' + id, data, config).then(res => {
        this.data.forEach((el, i) => {
          if (el.id === id) {
            const row = el
            row.image = null
            this.data.splice(i, 1, row)
          }
        })
      })
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
    setState (stateId) {
      this.$axios.post('customer/' + this.recordToEdit.id, {
        _method: 'PUT',
        state_id: stateId
      })
        .then(() => {
          this.recordToEdit.state_id = stateId
          const i = this.data.findIndex(el => parseInt(el.id) === parseInt(this.recordToEdit.id))
          this.data[i].state_id = stateId
        })
    }
  }
}
</script>
