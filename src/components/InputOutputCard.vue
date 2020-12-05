<template>
  <q-card class="my-card bg-white no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
        <div class="row">
          <div class="col-12 q-mb-sm">
            <q-badge color="transparent" class="text-subtitle1 text-weight-bold" :text-color="state.color" :label="state.name"/>
          </div>
          <div class="col-md-6">
            <q-input
              class="q-mt-dm q-mb-sm"
              filled
              v-model="selectedRow.created_at"
              label="Date de création"
              dense
              readonly
            />
          </div>
          <div class="col-md-4 offset-md-2">
            <q-input
              class="q-mt-dm q-mb-sm"
              filled
              v-model="selectedRow.code"
              label="Code"
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
              row-key="product_id"
              binary-state-sort
            >
              <template v-slot:body-cell-code="props">
                <q-td>
                  <div class="text-caption">{{ props.row.code }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-name="props">
                <q-td>
                  <div class="text-caption text-overflow">
                    {{ props.row.name }}
                    <q-tooltip>{{ props.row.name }}</q-tooltip>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-qty="props">
                <q-td>
                  <div class="text-caption text-grey-9">{{ props.row.qty }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-note="props">
                <q-td>
                  <div>{{ props.row.note }}</div>
                </q-td>
              </template>
            </q-table>
          </div>
          <div class="col-12 q-mt-sm">
            <q-input filled dense v-model="selectedRow.note" readonly label="note" type="text" autogrow />
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
          name: 'code',
          required: true,
          label: 'Code',
          align: 'left',
          field: row => row.code,
          format: val => `${val}`,
          sortable: true
        },
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
        { name: 'note', label: 'Observation', align: 'left' }
      ]
    }
  },
  components: { CardUserUpdatesInfo },
  methods: {
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
