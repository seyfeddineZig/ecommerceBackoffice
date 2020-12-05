<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Bons de retour</div>
          </q-toolbar-title>
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
        <ReturnedOrderCard v-if="recordToEdit !== null" :selectedRow="recordToEdit"></ReturnedOrderCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_RETURN')"
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
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.return_code }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-order_code="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.order_code }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-created_at="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.created_at }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-customer="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption">{{ props.row.last_name + ' ' + props.row.first_name }}</div>
              </q-td>
            </template>
          </q-table>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import ReturnedOrderCard from 'components/ReturnedOrderCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'orderPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      newState: null,
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
          name: 'order_code',
          required: true,
          label: 'Commande N°',
          align: 'left',
          sortable: true
        },
        {
          name: 'created_at',
          required: true,
          label: 'Date',
          align: 'left',
          sortable: true
        },
        {
          name: 'customer',
          label: 'à',
          required: true,
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  components: {
    ReturnedOrderCard,
    EmptyCard
  },
  mounted () {
    this.getReturnedOrders()
  },
  methods: {
    selectedRow () {
      return this.recordToEdit
    },

    getReturnedOrders () {
      this.$axios.get('/returnedOrder').then(res => {
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
      this.$axios.get('returnedOrder/' + id).then(res => {
        this.recordToEdit = res.data
      })
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
    }
  }
}
</script>
