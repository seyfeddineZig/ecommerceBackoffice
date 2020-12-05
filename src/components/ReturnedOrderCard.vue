<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
      <div class="row">
        <div class="col-md-6">
          <q-input
            class="q-mt-dm q-mb-sm"
            filled
            v-model="selectedRow.customer"
            label="Client"
            dense
            readonly
          />
        </div>
        <div class="col-md-4 offset-md-2">
          <q-input
            class="q-mt-dm q-mb-sm"
            filled
            v-model="selectedRow.return_code"
            label="Code"
            dense
            readonly
          />
        </div>
        <div class="col-md-4">
          <q-input
            class="q-mt-dm q-mb-sm"
            filled
            v-model="selectedRow.order_code"
            label="Commande N°"
            dense
            readonly
          />
        </div>
        <div class="col-12">
          <q-table
            class="my-sticky-header-table"
            flat
            dense
            separator="cell"
            bordered
            :data="selectedRow.detail || []"
            :pagination="initialPagination"
            :columns="columns"
            row-key="id"
            binary-state-sort
          >
            <template v-slot:body-cell-name="props">
              <q-td>
                <div class="text-caption text-overflow text-weight-bold">
                  {{ props.row.product_name }}
                  <q-tooltip>{{ props.row.name }}</q-tooltip>
                </div>
                <div
                  v-if="props.row.module === 'PRODUCT_PACKAGE'"
                  class="text-caption text-grey-9"
                >{{ 'Colis : ' + props.row.name + ' ( x' + props.row.package_qty + ' )' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-qty="props">
              <q-td>
                <div class="text-subtitle2 text-weight-bold text-blue-10">{{ props.row.qty }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-amount="props">
              <q-td>
                <div>{{ parseFloat(props.row.amount).toFixed(2) }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-total="props">
              <q-td>
                <div>{{ (parseFloat(props.row.amount) * parseFloat(props.row.qty)).toFixed(2) }}</div>
              </q-td>
            </template>
          </q-table>
        </div>
        <div class="col-12 q-mt-sm">
          <q-input
            filled
            dense
            v-model="selectedRow.note"
            readonly
            label="note"
            type="text"
            autogrow
          />
        </div>
      </div>
    </q-card-section>
    <q-separator/>
    <CardUserUpdatesInfo :selectedRow="selectedRow"></CardUserUpdatesInfo>
  </q-card>
</template>

<script>
import CardUserUpdatesInfo from './CardUserUpdatesInfo'
export default {
  name: 'inventoryCard',
  props: ['selectedRow', 'state', 't'],
  data () {
    return {
      initialPagination: {
        page: 1,
        rowsPerPage: 1000
      },
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Produit',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: 'qty',
          align: 'left',
          label: 'Qté',
          field: row => row.stock_qty,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: 'amount',
          align: 'left',
          label: 'Montant'
        },
        {
          name: 'total',
          align: 'left',
          label: 'Total'
        }
      ]
    }
  },
  components: { CardUserUpdatesInfo },
  methods: {
    printPiece () {
      const config = { responseType: 'arraybuffer' }
      this.$axios.get(
        '/printOrderShippingPiece/' + this.selectedRow.id,
        config
      )
        .then(res => {
          this.downloadFilePDF(res.data, 'report')
        })
    },
    downloadFilePDF (response, filename) {
      // It is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const newBlob = new Blob([response], { type: 'application/pdf' })

      // IE doesn't allow using a blob object directly as link href
      // instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob)
        return
      }
      // For other browsers:
      // Create a link pointing to the ObjectURL containing the blob.
      const data = window.URL.createObjectURL(newBlob)
      window.open(data)

      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data)
      }, 100)
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    }
  }
}
</script>
<style lang="sass" scoped>
.my-sticky-header-table
  /* height or max-height is important */
  height: 300px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #fdfdfd

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
