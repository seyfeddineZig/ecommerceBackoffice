<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Recherches des clients</div>
          </q-toolbar-title>
          <q-btn
            label="Nouvelle activité"
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
        :width="500"
        :breakpoint="500"
        content-class="bg-grey-1"
      >
        <customerSearchCard
          v-if="recordToEdit !== null"
          :selectedRow="recordToEdit"
        ></customerSearchCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            class="my-sticky-header-table no-border no-shadow"
            :dir="selectedLang.dir"
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
            <template v-slot:body-cell-name="props">
              <q-td @click="setRecordToEdit(props.row);">
                  <div class="text-caption text-weight-bold">{{ props.row.name }}
                    </div>
              </q-td>
            </template>
            <template v-slot:body-cell-type="props">
              <q-td @click="setRecordToEdit(props.row);">
                <div class="text-caption text-weight-bold">
                  {{ props.row.module === 'PRODUCT' ? 'Produit' : props.row.module === 'BRAND' ? 'Marque' : 'Catégorie du produit' }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-count_searches="props">
              <q-td @click="setRecordToEdit(props.row);">
                <div class="text-caption text-weight-bold text-blue-10">
                  {{ props.row.searches_count }}
                </div>
              </q-td>
            </template>
          </q-table>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import customerSearchCard from 'components/customerSearchCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'customerSearchPage',
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
          name: 'name',
          required: true,
          label: 'Désignation',
          align: 'left',
          sortable: true
        },
        {
          name: 'type',
          required: true,
          label: 'Nature',
          align: 'left',
          sortable: true
        },
        {
          name: 'count_searches',
          label: 'Nombre de recherches',
          required: true
        }
      ]
    }
  },
  computed: {
    selectedLang () {
      return this.$store.getters['config/getSelectedLang']
    }
  },
  components: {
    customerSearchCard,
    EmptyCard
  },
  mounted () {
    this.getSearches()
  },
  methods: {
    getSearches () {
      this.$axios.get('/getCustomerSearches').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },

    setRecordToEdit (row) {
      this.$axios.post('getSearchedItemDetails', {
        module: row.module,
        module_id: row.module_id
      })
        .then(res => {
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
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    }
  }
}
</script>
