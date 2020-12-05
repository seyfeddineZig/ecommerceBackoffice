<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 70vw; max-width: 80vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ recordToEdit === null ? 'Nouvel inventaire' : 'Modifier inventaire' }}</div>
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
              :data="products"
              :filter="filter"
              :loading="!fetched"
              :pagination="initialPagination"
              :columns="columns"
              row-key="row_key"
            >
              <template v-slot:top>
                <div class="text-subtitle2">Liste des produits</div>
                <q-space/>
                <q-input borderless dense debounce="300" color="primary" v-model="filter">
                  <template v-slot:append>
                    <q-icon name="search"/>
                  </template>
                </q-input>
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
                  <div class="text-caption text-grey-9">{{ props.row.real_qty || 0 }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-count="props">
                <q-td class="bg-grey-2">
                  <div class="text-pre-wrap">{{ props.row.product_count }}</div>
                  <q-popup-edit v-model="props.row.product_count">
                    <q-input type="number" v-model="props.row.product_count" dense autofocus/>
                  </q-popup-edit>
                </q-td>
              </template>

              <template v-slot:body-cell-diff="props">
                <q-td>
                  <div
                    :class="qtyCountDiff(props.row.real_qty , props.row.product_count) === 0 ? 'text-green' : qtyCountDiff(props.row.real_qty , props.row.product_count) === '-' ? 'text-grey-10' : 'text-red'"
                  >{{ qtyCountDiff(props.row.real_qty , props.row.product_count) }}</div>
                </q-td>
              </template>
            </q-table>
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
  props: ['recordToEdit', 'dialog'],
  data () {
    return {
      loading: false,
      filter: '',
      date: null,
      time: null,
      code: null,
      fetched: false,
      products: [],
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
        {
          name: 'count',
          align: 'left',
          label: 'Comptage',
          field: row => row.product_count,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'diff', label: 'Ecart', align: 'left' }
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
    this.getProducts()
    this.initFields()
  },
  methods: {
    initFields () {
      this.loading = false

      if (this.recordToEdit === null) {
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

        this.getProducts()
      } else {
        const dateTime = this.recordToEdit.created_at.split(' ')
        this.time = dateTime[1]
        this.date = dateTime[0]

        this.products.forEach(
          (el, j) => {
            const detail = this.recordToEdit.detail.find(e => e.product_id === el.id)
            if (detail) {
              this.products[j].product_count = detail.count
            } else {
              this.products[j].product_count = null
            }
          }
        )
      }
    },
    getProducts () {
      this.fetched = false
      this.$axios.get('/product').then(res => {
        this.products = res.data.filter(el => el.type === 'PRODUCT').map(obj => ({
          ...obj,
          product_count: null
        }))
        this.fetched = true
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
              this.products
                .filter(el => el.product_count)
                .map(obj => ({
                  product_id: obj.id,
                  product_count: obj.product_count,
                  product_qty: obj.real_qty || 0
                }))
            )
          )

          data.append('date', this.date)
          data.append('time', this.time)

          this.$axios
            .post(
              'inventory' +
                (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                type: 'success',
                message:
                  "L'inventaire a été " +
                  (method === 'post' ? 'créé' : 'modifiée') +
                  ' avec succés !'
              })
              const data = res.data
              data.detail = this.products
                .filter(el => el.product_count)
                .map(obj => ({
                  code: obj.code,
                  product_id: obj.id,
                  count: obj.product_count,
                  stock_qty: obj.real_qty,
                  inventory_id: res.data.id
                }))
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
    },
    qtyCountDiff (q, c) {
      if (c) {
        const diff = parseFloat(c) - parseFloat(q || 0)
        return diff
      }
      return '-'
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
