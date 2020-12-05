<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 90vw; max-width: 90vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ ( recordToEdit === null ? 'Nouvelle ' : 'Modifier ' ) + ( pieceType === 'input' ? ' entrée' : ' sortie' ) }}</div>
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
        <div class="row q-pa-sm">
          <div class="col-10 q-pa-sm">
            <div class="row items-start q-gutter-sm">
              <q-input
                style="max-width: 180px"
                dense
                v-model="date"
                filled
                type="date"
                hint="date"
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />

              <q-input
                style="max-width: 120px"
                dense
                v-model="time"
                filled
                type="time"
                hint="heure"
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
          </div>
          <div class="col-2 text-right items-end q-pa-sm">
            <q-input
              dense
              v-model="code"
              filled
              type="text"
              hint="Code"
              disable
              style="max-width: 150px"
            />
          </div>
        </div>
        <div class="row q-pa-sm">
          <div class="col-12">
            <q-table
              class="my-sticky-header-table"
              flat
              dense
              separator="cell"
              bordered
              :data="data"
              :filter="filter"
              :pagination="initialPagination"
              :columns="columns"
              row-key="row_key"
              binary-state-sort
            >
              <template v-slot:top>
                <div class="text-subtitle2">Contenu</div>
                <q-space/>
                <q-input borderless dense debounce="300" color="primary" v-model="filter">
                  <template v-slot:append>
                    <q-icon name="search"/>
                  </template>
                </q-input>
                <q-card class="full-width no-shadow" bordered>
                  <q-card-section>
                    <div class="row">
                      <div class="col-3 q-pa-xs">
                        <q-select
                          dense
                          filled
                          v-model="product"
                          use-input
                          hide-selected
                          fill-input
                          label="Produit"
                          @input="setPackages"
                          input-debounce="0"
                          :options="options"
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
                      <div class="col-3 q-pa-xs">
                        <q-select
                          dense
                          filled
                          v-model="productPackage"
                          use-input
                          hide-selected
                          fill-input
                          label="Colisage"
                          input-debounce="0"
                          :options="packageOptions"
                        >
                          <template v-slot:append>
                            <q-badge
                              v-if="productPackage !== null"
                              color="blue-10"
                              text-color="white"
                              :label="'Qté :' + productPackage.qty"
                            />
                            <q-icon
                              v-if="productPackage !== null"
                              class="cursor-pointer"
                              name="clear"
                              @click.stop="productPackage = null"
                            />
                          </template>
                        </q-select>
                      </div>
                      <div class="col-1 q-pa-xs" v-if="product">
                        <q-input
                          dense
                          filled
                          v-model="product.real_qty"
                          type="number"
                          label="Stock"
                          readonly
                        />
                      </div>
                      <div class="col-1 q-pa-xs">
                        <q-input dense filled v-model="qty" type="number" label="Qté"/>
                        <div v-if="error.qty" class="text-caption text-red">veuillez saisir la qté</div>
                        <div
                          v-if="error.qtyNegative"
                          class="text-caption text-red"
                        >La qté doit ètre supérieur de 0</div>
                      </div>
                      <div class="col-3 q-pa-xs">
                        <q-input dense filled v-model="note" type="text" label="Observation"/>
                      </div>
                      <div class="col-2 q-pa-xs">
                        <q-btn
                          color="blue-10 q-pa-xs"
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
                <q-td class="bg-grey-2">
                  <div class="text-caption text-grey-9">{{ props.row.qty }}</div>
                  <q-popup-edit v-model="props.row.qty">
                    <q-input type="number" v-model="props.row.qty" dense autofocus/>
                  </q-popup-edit>
                </q-td>
              </template>
              <template v-slot:body-cell-note="props">
                <q-td class="bg-grey-2">
                  <div class="text-pre-wrap">{{ props.row.note }}</div>
                  <q-popup-edit v-model="props.row.note">
                    <q-input type="text" v-model="props.row.note" dense autofocus/>
                  </q-popup-edit>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td style="width: 50px">
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
              </template>
            </q-table>
          </div>
        </div>
        <div class="row">
          <div class="col-12 q-pa-sm">
            <q-input filled dense v-model="pieceNote" type="text" label="Note" autogrow/>
          </div>
        </div>

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
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'CreateInventoryComponent',
  props: ['recordToEdit', 'dialog', 'products', 'pieceType', 'packages'],
  data () {
    return {
      loading: false,
      product: null,
      productPackage: null,
      qty: null,
      note: null,
      filter: '',
      date: null,
      time: null,
      code: null,
      pieceNote: null,
      options: [],
      packageOptions: [],
      error: {
        product: false,
        exist: false,
        qty: false
      },
      data: [],
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
          field: row => row.real_qty,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'note', label: 'Observation', align: 'left' },
        { name: 'actions', label: ' ', align: 'left' }
      ]
    }
  },
  watch: {
    dialog: function (val) {
      if (val) {
        this.initFields()
      }
    }
  },
  mounted () {
    this.initFields()
  },
  methods: {
    setPackages () {
      const id = this.product.id
      this.packageOptions = this.packages.filter(
        v =>
          v.product_id === id
      )
      const pkg = this.packageOptions.find(
        el => el.is_default_package === 1
      )
      this.productPackage = pkg !== undefined && this.packageOptions.length > 0 ? pkg : null
    },
    initFields () {
      this.loading = false
      if (this.recordToEdit === null) {
        this.data = []
        const date = new Date()
        this.time =
          (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) +
          ':' +
          (date.getMinutes() < 10
            ? '0' + date.getMinutes()
            : date.getMinutes())
        this.date =
          date.getFullYear() +
          '-' +
          (date.getMonth() + 1 < 10
            ? '0' + (date.getMonth() + 1)
            : date.getMonth() + 1) +
          '-' +
          (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
      } else {
        const dateTime = this.recordToEdit.created_at.split(' ')
        this.data = this.recordToEdit.detail
        this.time = dateTime[1]
        this.date = dateTime[0]
      }
    },
    addRow () {
      this.error.product = !this.product
      this.error.exist = this.data.find(
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
        let qty = this.qty
        if (this.productPackage !== null) {
          qty = qty * this.productPackage.qty
        }
        this.data.push({
          product_id: this.product.id,
          code: this.product.code,
          name: this.product.name,
          qty: qty,
          note: this.note
        })
        this.product = null
        this.productPackage = null
        this.qty = null
        this.note = null
      }
    },
    deleteRow (productId) {
      const i = this.data.findIndex(el => el.product_id === productId)
      if (i !== -1) {
        this.data.splice(i, 1)
      }
    },
    filterFn (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.options = this.products.filter(
          v =>
            v.type === 'PRODUCT' && (
              v.label.toLowerCase().indexOf(needle) !== -1 ||
            (v.code && v.code.toLowerCase().indexOf(needle) !== -1))
        )
      })
    },
    onSubmit () {
      this.loading = true
      this.$refs.form.validate().then(success => {
        if (success) {
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
          const method = this.recordToEdit === null ? 'post' : 'put'
          const data = new FormData()

          if (method === 'put') {
            data.append('_method', 'PUT')
          }

          data.append(
            'rows',
            JSON.stringify(
              this.data.map(obj => ({
                product_id: obj.product_id,
                qty: obj.qty || 0,
                note: obj.note
              }))
            )
          )

          data.append('date', this.date)
          data.append('time', this.time)
          data.append('note', this.pieceNote)

          this.$axios
            .post(
              this.pieceType +
                (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                type: 'success',
                message:
                  "L'entrée a été " +
                  (method === 'post' ? 'crée' : 'modifiée') +
                  ' avec succés !'
              })
              const data = res.data
              if (this.recordToEdit !== null) {
                data.updated_by = res.data.updated_by
              }
              this.$emit('updateTableRows', data)
            })
            .catch(err => {
              this.loading = false
              let message = ''
              if (err.response && err.response.status === 401) {
                message =
                  "Accés non autorisé, vous n'avez pas la permission pour effectuer cette operation"
              } else if (err.response.status === 422 && err.response.data.errors) {
                const errors = err.response.data.errors
                Object.keys(errors).forEach(el => {
                  message += errors[el].join(',') + '\n'
                })
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
  height: 380px

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
