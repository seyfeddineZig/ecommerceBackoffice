<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
      <div class="bg-white rounded-borders q-mb-md q-mt-md">
        <StatesCard :states="selectedRow.states" :current="state"></StatesCard>
      </div>
      <div class="bg-white rounded-borders q-mb-md">
        <CustomerCard :customer="selectedRow.customer"></CustomerCard>
      </div>

      <div class="bg-white rounded-borders q-mb-md">
        <q-expansion-item expand-separator default-opened expand-icon-toggle dense-toggle>
          <template v-slot:header>
            <q-item-section>
              <div class="text-subtitle2 text-weight-bold">Détail</div>
            </q-item-section>
          </template>
          <div class="row q-pa-md">
            <div class="col-md-4">
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
                    <div
                      class="text-caption text-grey-7"
                    >( {{ props.row.delivred_qty || 0 }} livré )</div>
                    <div
                      class="text-caption text-orange-7"
                    >( {{ props.row.returned_qty || 0 }} retourné )</div>
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
                v-model="selectedRow.shipping_adress"
                readonly
                label="Adresse de livraison"
                type="text"
                autogrow
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-card class="my-card no-shadow" bordered>
                <q-card-section>
                  <div class="row">
                    <div class="col-6 text-caption text-weight-bold">Sous total</div>
                    <div
                      class="col-6 text-caption text-weight-bold text-blue-10 text-right"
                    >{{ parseFloat(selectedRow.sub_total).toFixed(2) }}</div>
                    <div class="col-6 text-caption text-weight-bold">Livraison</div>
                    <div
                      class="col-6 text-caption text-weight-bold text-blue-10 text-right"
                    >{{ parseFloat(selectedRow.shipping_fees || 0).toFixed(2) }}</div>
                    <div class="col-6 text-subtitle1 text-weight-bold">Total</div>
                    <div
                      class="col-6 text-subtitle1 text-weight-bold text-blue-10 text-right"
                    >{{ (parseFloat(selectedRow.sub_total) + parseFloat(selectedRow.shipping_fees || 0)).toFixed(2) }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-expansion-item>
        <PaymentsCard
          :payments="selectedRow.payments"
          :payment="selectedRow.payment"
          :shippingFees="selectedRow.shipping_fees"
          :subTotal="selectedRow.sub_total"
          :order_id="selectedRow.id"
          :refreshOrder="refreshOrder"
        ></PaymentsCard>
      </div>
    </q-card-section>
    <q-separator/>
    <CardUserUpdatesInfo :selectedRow="selectedRow"></CardUserUpdatesInfo>
  </q-card>
</template>

<script>
import CustomerCard from './CustomerCard2'
import CardUserUpdatesInfo from './CardUserUpdatesInfo'
import StatesCard from './StatesCard'
import PaymentsCard from './PaymentsCard'

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
  components: { CardUserUpdatesInfo, CustomerCard, StatesCard, PaymentsCard },
  methods: {
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    },
    refreshOrder () {
      this.$emit('refreshOrder')
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
