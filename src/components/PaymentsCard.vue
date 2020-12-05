<template>
  <q-expansion-item expand-separator expand-icon-toggle dense-toggle>
    <template v-slot:header>
      <q-item-section>
        <div class="text-subtitle2 text-weight-bold">Paiement</div>
      </q-item-section>
      <q-item-section>
          <q-badge size="lg" class="q-pa-sm text-weight-bold text-h6" color="teal" text-color="white" :label="parseFloat(payment).toFixed(2) + ' DZD'" />
      </q-item-section>
    </template>
    <q-list>
      <q-separator horizontal/>
      <q-item-label header>
              <q-item-section>
        <div class="text-subtitle2 text-weight-bold">Journal des paiements</div>
      </q-item-section>
      <q-item-section>
        <div class="text-right text-subtitle2 text-weight-bold">
          <q-btn
            color="blue-10"
            size="sm"
            label="Nouveau paiement/remboursement"
            @click=" dialog = true"
          />
        </div>
      </q-item-section>
      </q-item-label>
      <q-item v-ripple v-for="(p, i) in payments" :key="i">
        <q-item-section avatar>
          <q-badge
            class="q-pa-xs"
            :color="p.type === 'REFUND' ? 'red-5' : 'teal-5'"
            text-color="white"
            :label="p.type === 'REFUND' ? 'remboursement' : 'paiement'"
          />
        </q-item-section>
        <q-item-section class="text-caption text-grey-8">
          Montant
          <div class="text-blue-10 text-weight-bold">{{ parseFloat(p.amount).toFixed(2) }} DZD</div>
        </q-item-section>
        <q-item-section class="text-caption text-grey-8">
          Ajouté le{{ p.created_at }}
          <div>Par : {{ p.user }}</div>
        </q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section>
          <div
            class="text-subtitle1 text-weight-bold"
          >Nouveau {{ type.name === 'PAYMENT' ? 'paiement' : 'remboursement'}}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit" ref="form" class="q-gutter-md">
            <q-select
              v-model="type"
              :options="types"
              label="Type"
              :rules="[val => !!val || 'Ce champ est obligatoire']"
              filled
              dense
            />
            <q-input
              v-model="amount"
              type="number"
              :hint="getAmounHint"
              label="Montant"
              :rules="checkAmount"
              filled
              dense
            />
            <q-input v-model="note" type="text" label="Note" autogrow filled dense/>
            <q-card-actions align="right">
              <q-btn
                flat
                type="button"
                label="Annuler"
                color="grey-10 q-pa-xs"
                size="sm"
                @click="dialog = false"
              />
              <q-btn type="submit" label="Enregistrer" color="blue-10 q-pa-xs" size="sm"/>
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-expansion-item>
</template>

<script>
export default {
  name: 'PaymentsCard',
  props: ['payments', 'payment', 'subTotal', 'shippingFees', 'order_id'],
  data () {
    return {
      dialog: false,
      types: [
        {
          name: 'PAYMENT',
          label: 'Paiement'
        },
        {
          name: 'REFUND',
          label: 'Remboursement'
        }
      ],
      type: null,
      amount: null,
      note: null
    }
  },
  watch: {
    type: function () {
      this.getMaxToPay()
    },
    dialog: function () {
      this.initFields()
    }
  },
  computed: {
    getAmounHint () {
      if (this.type === 'REFUND') {
        return 'Max à rembourser : ' + this.maxToPay.toFixed(2) + ' DZD'
      } else {
        return 'Max à payer : ' + this.maxToPay.toFixed(2) + ' DZD'
      }
    },
    checkAmount () {
      return [
        a =>
          (!!a && parseFloat(a) > 0 && parseFloat(a) <= this.maxToPay) ||
          'Le montant doit ètre inférieur de ' + this.maxToPay
      ]
    }
  },
  mounted () {
    this.initFields()
  },
  methods: {
    initFields () {
      this.type = this.types[0]
      this.amount = null
      this.note = null
      this.maxToPay =
        parseFloat(this.subTotal) +
        parseFloat(this.shippingFees || 0) -
        parseFloat(this.payment || 0)
    },
    getMaxToPay () {
      if (this.type.name === 'REFUND') {
        this.maxToPay = parseFloat(this.payment || 0)
      } else {
        this.maxToPay =
          parseFloat(this.subTotal) +
          parseFloat(this.shippingFees || 0) -
          parseFloat(this.payment || 0)
      }
    },
    onSubmit () {
      this.$refs.form.validate().then(success => {
        if (success) {
          this.$axios
            .post('payment', {
              type: this.type.name,
              amount: this.amount,
              order_id: this.order_id,
              note: this.note
            })
            .then(res => {
              this.$emit('refreshOrder')
              this.dialog = false
            })
            .catch(err => {
              if (err.response.status === 500 && err.response.data.err) {
                this.$q.notify({
                  type: 'negative',
                  message: err.response.data.err
                })
              }
            })
        }
      })
    }
  }
}
</script>
