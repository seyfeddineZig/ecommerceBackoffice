<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Avis des clients</div>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer
        side="right"
        v-model="drawerRight"
        bordered
        :width="500"
        :breakpoint="500"
        content-class="bg-grey-1"
      >
        <customerNoticeCard
         v-if="recordToEdit !== null"
         :selectedRow="recordToEdit"
         v-on:setNoticeState="setNoticeState(recordToEdit.id)"
         ></customerNoticeCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_CUSTOMER_ACTIVITY')"
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

            <template v-slot:body-cell-client="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div
                  class="text-caption text-weight-bold"
                >{{ props.row.last_name + ' ' + props.row.first_name}}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-product_name="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div
                  class="text-caption text-weight-bold"
                >{{ props.row.product_name}}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-is_approved="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-weight-bold text-teal" v-if="props.row.is_approved === 1">Approuvé</div>
                <div class="text-weight-bold text-red" v-else>Non approuvé</div>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td
                auto-width
                style="border-right:4px solid #0d47a1"
                v-if="recordToEdit!==null && recordToEdit.id === props.row.id"
              >
                <q-btn flat round class="bg-grey-2 q-pa-xs" color="grey-6" size="xs">
                  <q-icon name="fas fa-trash" color="grey-9"/>
                </q-btn>
                <q-btn
                  v-if="props.row.is_approved === 0"
                  flat
                  class="bg-blue-2 q-ml-xs q-pa-xs"
                  color="blue-10"
                  size="xs"
                  @click="setNoticeState(props.row.id)"
                >
                  Approuver
                </q-btn>
                <q-btn
                  v-if="props.row.is_approved === 1"
                  flat
                  class="bg-red-2 q-ml-xs q-pa-xs"
                  color="red-8"
                  size="xs"
                  @click="setNoticeState(props.row.id)"
                >
                  Désapprouver
                </q-btn>
              </q-td>
              <q-td v-else></q-td>
            </template>
          </q-table>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import customerNoticeCard from 'components/CustomerNoticeCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'customerNoticePage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      fetched: false,
      selected: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 20
      },
      filter: '',
      columns: [
        {
          name: 'client',
          required: true,
          label: 'client',
          align: 'left',
          sortable: true
        },
        {
          name: 'product_name',
          required: true,
          label: 'Produit',
          align: 'left',
          sortable: true
        },
        {
          name: 'is_approved',
          required: true,
          label: 'Etat',
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
    customerNoticeCard,
    EmptyCard
  },
  mounted () {
    this.getNotices()
  },
  methods: {
    getNotices () {
      this.$axios.get('/customerNotice').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },

    updateTableRows (data) {
      const index = this.data.findIndex(e => e.id === data.id)
      if (index !== -1) {
        this.data.splice(index, 1, data)
      } else {
        this.data.push(data)
      }
      this.setRecordToEdit(data.id)
      this.dialog = false
    },
    setRecordToEdit (id) {
      this.$axios.get('customerNotice/' + id).then(res => {
        this.recordToEdit = res.data
      })
    },
    setNoticeState (id) {
      this.$axios.post('setCustomerNoticeState/' + id)
        .then(res => {
          const i = this.data.findIndex(el => el.id === id)
          if (i !== -1) {
            const approved = this.data[i].is_approved === 1 ? 0 : 1
            this.data[i].is_approved = approved
            this.recordToEdit.is_approved = approved
          }
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
