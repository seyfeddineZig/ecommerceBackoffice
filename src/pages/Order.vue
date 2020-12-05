<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Commandes</div>
          </q-toolbar-title>
          <div v-if="recordToEdit" class="">
            <q-btn
              v-if="recordToEdit.state_id === 3 || recordToEdit.state_id === 7"
              flat
              class="q-ml-xs bg-red-2 q-pa-xs"
              color="red-8"
              label="Annuler"
              size="sm"
              @click="openConfirmDialog(9)"
            ></q-btn>
            <q-btn
              v-if="recordToEdit.state_id === 3"
              flat
              class="q-ml-xs bg-blue-2 q-pa-xs"
              color="blue-10"
              label="Mettre en préparation"
              size="sm"
              @click="openConfirmDialog(7)"
            ></q-btn>
            <q-btn
              v-if="recordToEdit.state_id === 7 || ( recordToEdit.state_id === 8 && !allDelivred() )"
              flat
              class="q-ml-xs bg-blue-2 q-pa-xs"
              color="blue-10"
              label="Mettre en livraison"
              size="sm"
              @click="openConfirmDialog(8)"
            ></q-btn>
            <q-btn
              v-if=" recordToEdit.state_id === 8 && !allReturned()"
              flat
              class="q-ml-xs bg-orange-2 q-pa-xs"
              color="orange-8"
              label="Retour de produits"
              size="sm"
              @click="openConfirmDialog(-1)"
            ></q-btn>

            <q-btn
              v-if="recordToEdit.state_id === 8 && allDelivred()"
              flat
              class="q-ml-xs bg-teal-2 q-pa-xs"
              color="teal-10"
              label="Clôturer la commande"
              size="sm"
              @click="openConfirmDialog(2)"
            ></q-btn>
          </div>
        </q-toolbar>

      </q-header>

      <q-drawer
        side="right"
        v-model="drawerRight"
        bordered
        :width="600"
        :breakpoint="600"
        content-class="bg-grey-2"
      >
        <OrderCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          :state="getState(recordToEdit.state_id)"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:setOrderState="openConfirmDialog"
          v-on:refreshOrder="refreshOrder"
        ></OrderCard>
        <EmptyCard v-else></EmptyCard>
        <q-dialog v-model="confirm" persistent>
          <q-card>
            <q-card-section class="row">
              <span class="q-pt-xl q-pl-md q-pr-md text-center text-subtitle2">
                Voulez vous vraiment
                {{ newState === 7
                ? ' mettre en préparation ' : newState === 9
                ? ' Annuler ' : newState === 2
                ? ' clôturer ' : ' mettre en livraison ' }}
                cette commande ?
              </span>
            </q-card-section>
            <q-card-section>
              <div class="row">
                <div class="col-12 text-center q-pa-md q-gutter-sm">
                  <q-btn
                    flat
                    size="sm"
                    class="q-pa-sm bg-grey-2 text-weight-bold"
                    label="Annuler"
                    color="grey-10"
                    @click="confirm = false"
                  />
                  <q-btn
                    flat
                    size="sm"
                    class="q-pa-sm bg-blue-2 text-weight-bold"
                    label="Confirmer"
                    color="blue-10"
                    @click="setOrderState()"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_ORDER')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="data"
            :filter="filter"
            :columns="columns"
            :loading="!fetched"
            row-key="row_key"
            :selected.sync="selected"
            :selected-rows-label="getSelectedString"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>
            <template v-slot:body-cell-code="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.code || '---' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-order_date="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.order_date || '---' }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-state="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <q-badge
                  :color="getState(props.row.state_id).color"
                  text-color="white"
                  :label="getState(props.row.state_id).name"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-customer="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption">{{ props.row.last_name + ' ' + props.row.first_name }}</div>
              </q-td>
            </template>
          </q-table>
        </q-page>
      </q-page-container>

      <OrderShippingComponent
        v-if="selectedRowShipping !== null"
        :selectedRowShipping="selectedRowShipping"
        :shippingDialog="shippingDialog"
        v-on:closeDialog="shippingDialog = false"
        v-on:refreshOrder="refreshOrder"
        :order="recordToEdit"
      ></OrderShippingComponent>

      <ReturnedOrderComponent
        v-if="selectedRowReturn !== null"
        :selectedRowReturn="selectedRowReturn"
        :returnDialog="returnDialog"
        v-on:closeDialog="returnDialog = false"
        v-on:refreshOrder="refreshOrder"
        :order="recordToEdit"
      ></ReturnedOrderComponent>
    </q-layout>
  </q-page>
</template>

<script>
import OrderCard from 'components/OrderCard'
import OrderShippingComponent from 'components/OrderShippingComponent'
import ReturnedOrderComponent from 'components/ReturnedOrderComponent'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'orderPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      shippingDialog: false,
      returnDialog: false,
      recordToEdit: null,
      newState: null,
      data: [],
      states: [],
      confirm: false,
      fetched: false,
      selected: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 20
      },
      selectedRowShipping: null,
      selectedRowReturn: null,
      filter: '',
      columns: [
        {
          name: 'code',
          required: true,
          label: 'Code',
          align: 'left',
          sortable: true
        },
        {
          name: 'order_date',
          required: true,
          label: 'Date',
          align: 'left',
          sortable: true
        },
        {
          name: 'state',
          required: true,
          label: 'Etat',
          align: 'left',
          sortable: true
        },
        {
          name: 'customer',
          label: 'Client',
          required: true,
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  components: {
    OrderCard,
    OrderShippingComponent,
    ReturnedOrderComponent,
    EmptyCard
  },
  mounted () {
    this.getStates()
    this.getOrders()
  },
  methods: {
    openConfirmDialog (stateId) {
      this.newState = stateId
      if (this.newState !== 8 && this.newState !== -1) {
        this.confirm = true
      } else {
        this.setOrderState()
      }
    },
    getState (stateId) {
      return this.states.find(el => el.id === stateId)
    },
    selectedRow () {
      return this.recordToEdit
    },

    getStates () {
      this.$axios.get('/state').then(res => {
        this.states = res.data
      })
    },
    getOrders () {
      this.$axios.get('/order').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },
    updateTableRows (data) {
      if (this.recordToEdit === null) {
        this.data.unshift(data)
      } else {
        const index = this.data.findIndex(el => el.id === data.id)
        if (index !== -1) {
          this.data.splice(index, 1, data)
        }
      }
      this.dialog = false
    },
    refreshOrder () {
      this.setRecordToEdit(this.recordToEdit.id)
      this.shippingDialog = false
      this.returnDialog = false
    },
    setRecordToEdit (id) {
      this.$axios.get('order/' + id).then(res => {
        this.recordToEdit = res.data
      })
    },
    getSelectedString () {
      return this.selected.length === 0
        ? ''
        : `${this.selected.length} ligne${
            this.selected.length > 1 ? 's' : ''
          } selectionné${this.selected.length > 1 ? 's' : ''} de ${
            this.data.length
          }`
    },
    addRowToSelected (row) {
      const i = this.selected.findIndex(el => el.id === row.id)

      if (i === -1) {
        this.selected.push(row)
      } else {
        this.selected.splice(i, 1)
      }
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    },
    setOrderState () {
      if (this.recordToEdit !== null) {
        const id = this.recordToEdit.id
        this.$axios
          .post('order/' + id, {
            _method: 'PUT',
            state_id: this.newState
          })
          .then(res => {
            if (this.newState === 8) {
              this.selectedRowShipping = res.data.map(obj => ({
                ...obj,
                qty_to_deliver: obj.qty - obj.delivred_qty
              }))

              this.shippingDialog = true
            } else if (this.newState === -1) {
              this.selectedRowReturn = res.data.map(obj => ({
                ...obj,
                qty_to_return: obj.delivred_qty - obj.returned_qty
              }))

              this.returnDialog = true
            } else {
              const i = this.data.findIndex(
                el => parseInt(el.id) === parseInt(id)
              )
              if (i !== -1) {
                this.data[i].state_id = this.newState
                this.recordToEdit.state_id = this.newState
                // this.data[i].code = res.data
              }
              this.confirm = false
              this.$q.notify({
                color: 'blue-10',
                message: 'La commande a été modifiée avec succés'
              })
            }
            this.newState = null
          })
          .catch(err => {
            this.confirm = false
            let message = ''

            if (err.response.status === 401) {
              message =
                "Accés non autorisé, vous n'avez pas la permission pour effectuer cette operation"
            } else if (err.response && err.response.data) {
              message = err.response.data.message
            }
            this.$q.notify({
              type: 'negative',
              message: message
            })
          })
      } else {
        this.confirm = false
      }
    },
    allDelivred () {
      return this.recordToEdit.detail.filter(
        el => el.qty > el.delivred_qty
      ).length === 0
    },
    allReturned () {
      return this.recordToEdit.detail.filter(
        el => el.qty > el.returned_qty
      ).length === 0
    }
  }
}
</script>
