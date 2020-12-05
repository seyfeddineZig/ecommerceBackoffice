<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Etat du stock</div>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_STOCK')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="data"
            :columns="columns"
            :loading="!fetched"
            row-key="product_id"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-name="props">
              <q-td>
                <div class="text-caption text-weight-bold text-overflow">
                  {{ props.row.name }}
                  <q-tooltip>{{ props.row.name }}</q-tooltip>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-code="props">
              <q-td>
                <div class="text-caption text-weight-bold">{{ props.row.code }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-category_name="props">
              <q-td>
                <div class="text-caption text-weight-bold">{{ props.row.category_name }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-alert_qty="props">
              <q-td>
                <div class="text-caption text-red-5 text-weight-bold">{{ props.row.alert_qty || 'non spécifié' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-real_qty="props">
              <q-td>
                <div class="text-caption text-weight-bold text-teal">{{ props.row.real_qty }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-virtual_qty="props">
              <q-td>
                <div class="text-caption text-weight-bold text-blue-8">{{ props.row.virtual_qty }}</div>
              </q-td>
            </template>
          <template v-slot:body-cell-note="props">
              <q-td>
                <div class="text-caption text-weight-bold text-blue-8">
                  <q-badge class="q-pa-sm" :color="getStockNote(props.row).color" text-color="white" :label="getStockNote(props.row).note" />
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
export default {
  name: 'StockPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      fetched: false,
      selected: [],
      filter: '',
      initialPagination: {
        page: 1,
        rowsPerPage: 200
      },
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Désignation',
          align: 'left',
          sortable: true
        },
        {
          name: 'code',
          required: true,
          label: 'Code',
          align: 'left',
          sortable: true
        },
        {
          name: 'category_name',
          required: true,
          label: 'Catégorie',
          align: 'left',
          sortable: true
        },
        {
          name: 'alert_qty',
          required: true,
          label: 'Qté d\'alerte',
          align: 'left',
          sortable: true
        },
        {
          name: 'real_qty',
          required: true,
          label: 'Qté reèlle',
          align: 'left',
          sortable: true
        },
        {
          name: 'virtual_qty',
          required: true,
          label: 'Qté virtuelle',
          align: 'left',
          sortable: true
        },

        {
          name: 'note',
          required: true,
          label: 'remarque',
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  mounted () {
    this.getStock()
  },
  methods: {
    getStockNote (s) {
      let note = ''
      let color = ''

      if (s.virtual_qty === 0 || ((s.virtual_qty || 0) < s.alert_qty)) {
        note = 'Non disponible'
        color = 'red'
      } else if ((s.alert_qty || 0) === s.virtual_qty) {
        note = 'stock limité'
        color = 'orange'
      } else if ((s.virtual_qty || 0) > s.alert_qty) {
        note = 'en stock'
        color = 'teal'
      }

      return {
        note: note,
        color: color
      }
    },
    getStock () {
      this.$axios.get('/stock').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },

    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    }
  }
}
</script>
