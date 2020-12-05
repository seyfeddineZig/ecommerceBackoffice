<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
      <q-expansion-item expand-separator default-opened expand-icon-toggle label="Détail">
        <div class="row">
          <div v-if="selectedRow.state_id === 1" class="col text-right q-mt-xs q-mb-xs">
            <q-btn flat round class="bg-grey-2 q-pa-xs" color="grey-6" size="xs">
              <q-icon name="fas fa-trash" color="grey-9"/>
            </q-btn>
            <q-btn
              flat
              round
              class="q-ml-xs bg-grey-2 q-pa-xs"
              color="grey-6"
              size="xs"
              @click="$emit('editRecord')"
            >
              <q-icon name="fas fa-pen" color="grey-9"/>
            </q-btn>
            <q-btn
              flat
              v-if="hasRole('VALIDATE_INVENTORY')"
              class="q-ml-xs bg-blue-10 q-pa-xs"
              color="grey-1"
              size="xs"
              label="valider"
              icon="fas fa-check"
              @click="$emit('validate')"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-12 q-mb-sm">
            <q-badge :color="state.color" class="q-pa-sm" text-color="white" :label="state.name"/>
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
                  <div class="text-caption text-grey-9">{{ props.row.stock_qty || 0 }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-count="props">
                <q-td class="bg-grey-2">
                  <div class="text-pre-wrap">{{ props.row.count }}</div>
                </q-td>
              </template>

              <template v-slot:body-cell-diff="props">
                <q-td>
                  <div
                    :class="qtyCountDiff(props.row.stock_qty , props.row.count) === 0 ? 'text-green' : qtyCountDiff(props.row.stock_qty , props.row.count) === '-' ? 'text-grey-10' : 'text-red'"
                  >{{ qtyCountDiff(props.row.stock_qty , props.row.count) }}</div>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </q-expansion-item>
    </q-card-section>
    <q-separator/>
    <CardUserUpdatesInfo :selectedRow="selectedRow.record"></CardUserUpdatesInfo>
  </q-card>
</template>

<script>
import CardUserUpdatesInfo from './CardUserUpdatesInfo'
export default {
  name: 'inventoryCard',
  props: ['selectedRow', 'state'],
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
        {
          name: 'count',
          align: 'left',
          label: 'Comptage',
          field: row => row.count,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'diff', label: 'Ecart', align: 'left' }
      ]
    }
  },
  components: { CardUserUpdatesInfo },
  methods: {
    qtyCountDiff (q, c) {
      return parseFloat(c || 0) - parseFloat(q || 0)
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
