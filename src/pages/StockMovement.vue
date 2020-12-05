<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Mouvement du stock</div>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_STOCK_MOVEMENT')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="data"
            :columns="columns"
            :loading="!fetched"
            row-key="row_key"
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
            <template v-slot:body-cell-type="props">
              <q-td>
                <div class="text-caption text-weight-bold">{{ getMvtType(props.row.mvt_type) }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-piece_code="props">
              <q-td>
                <div class="text-caption text-weight-bold">{{ props.row.piece_code }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-stock_qty="props">
              <q-td>
                <div class="text-caption text-weight-bold text-teal">{{ props.row.stock_qty }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-mvt_qty="props">
              <q-td>
                <div class="text-caption text-weight-bold text-blue-8">{{ props.row.mvt_qty }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-arrow="props">
              <q-td>
                <div class="text-caption text-weight-bold">
                  <q-icon
                    v-if="(props.row.mvt_type === 'INVENTORY'
                  && parseFloat(props.row.mvt_qty) < parseFloat(props.row.stock_qty)) || props.row.mvt_type === 'OUTPUT' || props.row.mvt_type === 'CUSTOMER_ORDER' || props.row.mvt_type === 'SHIPPING'"
                    name="fas fa-long-arrow-alt-up"
                    color="red"
                  />
                  <q-icon v-else name="fas fa-long-arrow-alt-down" color="teal"/>
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
      filter: '',
      fetched: false,
      selected: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 200
      },
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Produit',
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
          name: 'type',
          required: true,
          label: 'Type',
          align: 'left',
          sortable: true
        },
        {
          name: 'piece_code',
          required: true,
          label: 'Code de la pièce',
          align: 'left',
          sortable: true
        },
        {
          name: 'stock_qty',
          required: true,
          label: 'Stock',
          align: 'left',
          sortable: true
        },
        {
          name: 'mvt_qty',
          required: true,
          label: 'Qté Mvt',
          align: 'left',
          sortable: true
        },
        {
          name: 'arrow',
          required: true,
          label: ' ',
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  mounted () {
    this.getStockMovement()
  },
  methods: {
    getStockMovement () {
      this.$axios.get('/stockMovement').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },
    getMvtType (type) {
      let frType = ''
      switch (type) {
        case 'INVENTORY':
          frType = 'Inventaire'
          break
        case 'INPUT':
          frType = 'Entrée'
          break
        case 'OUTPUT':
          frType = 'Sortie'
          break
        case 'SHIPPING':
          frType = 'Bon de livraison'
          break
        case 'RETURN':
          frType = 'Bon de retour'
          break

        default:
          break
      }
      return frType
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    }
  }
}
</script>
