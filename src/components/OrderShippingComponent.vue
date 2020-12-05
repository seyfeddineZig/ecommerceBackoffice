<template>
  <q-dialog v-model="shippingDialog" persistent>
    <q-card style="width: 800px; max-width: 80vw;" class="my-card no-shadow">
      <q-form @submit="onSubmit" ref="form">
        <q-card-section class="bg-grey-1 no-padding">
          <div class="row q-pa-sm">
            <div class="col-6">
              <div class="text-subtitle1 q-pl-sm">Nouveau bon de livraison</div>
            </div>
            <div class="col-6 text-right q-pr-xs">
              <q-btn
                round
                flat
                type="button"
                icon="fas fa-times"
                color="grey-10"
                size="xs"
                class="q-pa-xs"
                @click="$emit('closeDialog')"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-xs q-gutter-xs">
          <div class="row">
            <div class="col-12 text-subtitle2 q-mt-md">
              Commande N°
              <span class="text-weight-bold">{{ order.code }}</span>
            </div>
            <div class="col-12 text-subtitle2">
              à
              <span class="text-weight-bold">{{ order.customer }}</span>
            </div>
            <div class="col-12 text-subtitle2 q-mb-md">
              adresse de livraison
              <span
                class="text-weight-bold"
              >{{ order.shipping_adress || '---' }}</span>
            </div>
            <div class="col-12">
              <q-table
                flat
                separator="cell"
                bordered
                :data="selectedRowShipping || []"
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
                    <div
                      class="text-subtitle2 text-weight-bold text-grey-9"
                    >{{ props.row.qty - props.row.delivred_qty }}</div>
                  </q-td>
                </template>
                <template v-slot:body-cell-qty_to_deliver="props">
                  <q-td>
                    <q-input
                      filled
                      dense
                      v-model="props.row.qty_to_deliver"
                      type="number"
                      @input="checkQty(props.row)"
                    />
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
          <div class="row">
            <div class="col-12 q-pt-sm q-pb-sm">
              <q-input dense filled v-model="note" type="text" label="Note" autogrow/>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-xs bg-grey-1">
          <div class="row">
            <div class="col-12 text-right q-gutter-sm q-pt-md q-pb-sm">
              <q-btn
                type="submit"
                class="q-pa-xs"
                color="blue-10"
                size="sm"
                :disable="loading?true:false"
              >
                <div v-if="loading" class="col-md-3 justify-center">
                  <q-circular-progress
                    indeterminate
                    size="30px"
                    :thickness=".3"
                    color="grey-1"
                    track-color="transparent"
                    class="q-pr-md"
                  />
                </div>

                <div class="text-body">Enregistrer</div>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'OrderShippingComponent',
  props: ['shippingDialog', 'selectedRowShipping', 'order'],
  data () {
    return {
      loading: false,
      note: '',
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
          sortable: true
        },
        {
          name: 'qty',
          align: 'left',
          label: 'Qté restante',
          sortable: true
        },
        {
          name: 'qty_to_deliver',
          align: 'left',
          label: 'Qté à livrer',
          sortable: true
        }
      ]
    }
  },
  methods: {
    checkQty (row) {
      if (row.qty_to_deliver > row.qty - row.delivred_qty) {
        row.qty_to_deliver = row.qty - row.delivred_qty
      }
      if (row.qty_to_deliver < 0) {
        row.qty_to_deliver = 0
      }
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    },

    onSubmit () {
      this.loading = true
      this.$refs.form.validate().then(success => {
        if (success) {
          this.$axios
            .post('/orderShipping', {
              rows: this.selectedRowShipping.filter(
                el =>
                  el.qty_to_deliver &&
                  el.qty_to_deliver !== null &&
                  parseFloat(el.qty_to_deliver) > 0
              ),
              note: this.note
            })
            .then(res => {
              this.loading = false
              this.$q.notify({
                color: 'blue-10',
                message: 'Le bon de livraison a été créé avec succés'
              })
              this.$emit('refreshOrder')
            })
            .catch(err => {
              this.loading = false
              let message = ''
              if (err.response) {
                if (err.response.status === 401) {
                  message =
                    "Accés non autorisé, vous n'avez pas la permission pour effectuer cette operation"
                } else if (
                  err.response.status === 500 &&
                  err.response.data.error
                ) {
                  message = err.response.data.error
                } else if (
                  err.response.status === 422 &&
                  err.response.data.errors
                ) {
                  const errors = err.response.data.errors
                  Object.keys(errors).forEach(el => {
                    message += errors[el].join(',') + '\n'
                  })
                }
              }
              this.$q.notify({
                type: 'negative',
                message: message
              })
            })
        }
      })
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
