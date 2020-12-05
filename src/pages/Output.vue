<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Sortie du stock</div>
          </q-toolbar-title>
          <div v-if="recordToEdit && recordToEdit.state_id === 1">
            <q-btn
              flat
              v-if="hasRole('VALIDATE_' + t.toUpperCase())"
              class="q-ml-xs bg-teal-2 q-pa-xs text-weight-bold"
              color="teal-10"
              size="sm"
              label="valider"
              @click="confirm = true"
            />
            <q-btn
              flat
              class="bg-red-1 q-ml-sm text-weight-bold q-pa-xs"
              color="red-8"
              size="sm"
              label="supprimer"
            />
            <q-btn
              flat
              class="q-ml-sm bg-grey-3 text-weight-bold q-pa-xs"
              color="grey-8"
              size="sm"
              label="modifier"
              @click="setRecordToEdit(recordToEdit.id); dialog= true"
            />
          </div>
          <q-btn
            v-if="hasRole('POST_INPUT')"
            flat
            label="Nouveau"
            class="q-ml-sm bg-blue-2 q-pa-xs text-weight-bold"
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
        <inputCard
          v-if="recordToEdit !== null && !dialog"
          :t="t"
          :selectedRow="recordToEdit"
          :state="getState(recordToEdit.state_id)"
        ></inputCard>
        <EmptyCard v-else></EmptyCard>
        <q-dialog v-model="confirm" persistent>
          <q-card>
            <q-card-section class="row">
              <span
                class="q-ml-sm q-pa-lg text-weight-bold text-center"
              >Voulez vous vraiment valider cette sortie ?</span>
            </q-card-section>
            <q-card-section>
              <div class="text-center">
                <q-btn
                  flat
                  label="Annuler"
                  size="md"
                  class="text-weight-bold"
                  color="grey-10"
                  @click="confirm = false"
                />
                <q-btn
                  flat
                  label="Confirmer"
                  size="md"
                  class="text-weight-bold"
                  color="blue-10"
                  @click="validateOutput()"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_INPUT')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="data"
            :filter="filter"
            :columns="columns"
            :loading="!fetched"
            row-key="row_key"
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
              <q-td v-bind:class="[recordToEdit && recordToEdit.id === props.row.id ? 'bg-blue-1' : '', 'cursor-pointer']" @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.code || '---' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-state="props">
              <q-td v-bind:class="[recordToEdit && recordToEdit.id === props.row.id ? 'bg-blue-1' : '', 'cursor-pointer']" @click="setRecordToEdit(props.row.id);">
                <q-badge
                  :color="getState(props.row.state_id).color"
                  text-color="white"
                  :label="getState(props.row.state_id).name"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-created_at="props">
              <q-td v-bind:class="[recordToEdit && recordToEdit.id === props.row.id ? 'bg-blue-1' : '', 'cursor-pointer']" @click="setRecordToEdit(props.row.id);">
                <div class="text-caption">{{ props.row.created_at || '---' }}</div>
              </q-td>
            </template>
          </q-table>

          <outputComponent
            v-if="hasRole('POST_INPUT') || hasRole('PUT_INPUT')"
            :products="products"
            :packages="productPackages"
            :dialog="dialog"
            :pieceType="t"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></outputComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import outputComponent from 'components/inputOutputComponent'
import inputCard from 'components/inputOutputCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'outputPage',
  data () {
    return {
      t: 'output',
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      products: [],
      productPackages: [],
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
          label: 'Date de sortie',
          required: true,
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  components: {
    outputComponent,
    inputCard,
    EmptyCard
  },
  mounted () {
    this.getStates()
    this.getOutputs()
    this.getProducts()
    this.getProductPackages()
  },
  methods: {
    getState (stateId) {
      return this.states.find(el => el.id === stateId)
    },
    selectedRow () {
      return this.recordToEdit
    },

    getStates () {
      this.$axios.get('/state').then(res => {
        this.states = res.data
      })
    },
    getOutputs () {
      this.$axios.get('/output').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },
    getProducts () {
      this.$axios.get('/product').then(res => {
        this.products = res.data
      })
    },
    getProductPackages () {
      this.$axios.get('/productPackage').then(res => {
        this.productPackages = res.data
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
      if (
        this.recordToEdit === null ||
        this.dialog === true ||
        parseInt(this.recordToEdit.id) !== parseInt(id)
      ) {
        this.$axios.get('input/' + id).then(res => {
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
    validateOutput () {
      if (this.recordToEdit !== null) {
        const id = this.recordToEdit.id
        const data = new FormData()
        data.append('_method', 'PUT')
        this.$axios
          .post('validateOutput/' + id, data)
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
              message: 'La sortie a été validée avec succés'
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
