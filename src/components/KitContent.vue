<template>

              <div class="row">
                <div class="col-12">
                  <q-table :data="kitContent" :columns="columns" row-key="name">
                    <template v-if="action !== 'EDIT'" v-slot:top>
                      <q-card class="full-width no-shadow" bordered>
                        <q-card-section>
                          <div class="row">
                            <div class="col-5 q-pa-xs">
                              <q-select
                                dense
                                filled
                                v-model="product"
                                use-input
                                hide-selected
                                fill-input
                                label="Produit"
                                input-debounce="0"
                                :options="productsOptions"
                                @filter="filterFn"
                              />
                              <div
                                v-if="error.product"
                                class="text-caption text-red"
                              >veuillez choisir un produit</div>
                              <div
                                v-if="error.exist"
                                class="text-caption text-red"
                              >Ce produit existe déja !</div>
                            </div>
                            <div class="col-2 q-pa-xs">
                              <q-input dense filled v-model="qty" type="number" label="Qté"/>
                              <div
                                v-if="error.qty"
                                class="text-caption text-red"
                              >veuillez saisir la qté</div>
                              <div
                                v-if="error.qtyNegative"
                                class="text-caption text-red"
                              >La qté doit ètre supérieur de 0</div>
                            </div>
                            <div class="col-4 q-pa-xs">
                              <q-btn
                                color="blue-10 q-pa-sm"
                                icon="add"
                                type="button"
                                size="sm"
                                label="Ajouter une ligne"
                                @click="addRow"
                              />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </template>
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
                    <template v-slot:body-cell-actions="props">
                      <q-td v-if="props.row.kit_id === undefined">
                        <q-btn
                          flat
                          round
                          class="bg-grey-2 q-pa-xs"
                          color="grey-6"
                          size="xs"
                          @click="deleteRow(props.row.product_id)"
                        >
                          <q-icon name="fas fa-trash" color="grey-9"/>
                        </q-btn>
                      </q-td>
                      <q-td v-else></q-td>
                    </template>
                  </q-table>
                </div>
              </div>
</template>
<script>
export default {
  name: 'KitContent',
  props: ['products', 'kitContent', 'action'],
  data () {
    return {
      fields: {},
      loading: false,
      isActif: true,
      langs: [],
      qty: 0,
      productsOptions: [],
      product: null,
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
          field: row => row.real_qty,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'actions', label: ' ', align: 'left' }
      ],
      error: {
        product: false,
        exist: false,
        qty: false
      }
    }
  },
  methods: {
    filterFn (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.productsOptions = this.products.filter(
          v =>
            v.label.toLowerCase().indexOf(needle) !== -1 ||
            (v.code && v.code.toLowerCase().indexOf(needle) !== -1)
        )
      })
    },
    addRow () {
      this.error.product = !this.product
      this.error.exist = this.kitContent.find(
        el => el.product_id === this.product.id
      )
      this.error.qty = !this.qty
      this.error.qtyNegative = parseFloat(this.qty) <= 0
      if (
        !this.error.product &&
        !this.error.qty &&
        !this.error.exist &&
        !this.error.qtyNegative
      ) {
        const row = {
          product_id: this.product.id,
          code: this.product.code,
          name: this.product.name,
          qty: this.qty
        }
        this.$emit('addKitContent', row)
        this.product = null
        this.qty = null
      }
    },
    deleteRow (productId) {
      this.$emit('deleteKitContent', productId)
    }
  }
}
</script>
