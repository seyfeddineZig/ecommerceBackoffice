<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
      <div class="row">
        <div class="col text-right q-mt-xs q-mb-xs">
          <q-btn
            v-if="selectedRow.state_id !== 4"
            flat
            class="q-pa-xs bg-red-1"
            label="Bloquer"
            color="red-8"
            size="sm"
            @click="$emit('setState', 4)"
          />
          <q-btn
            v-if="selectedRow.state_id === 4"
            flat
            class="q-pa-xs bg-teal-1"
            label="Debloquer"
            color="teal-8"
            size="sm"
            @click="$emit('setState', 5)"
          />
          <q-btn
            v-if="selectedRow.state_id === 3"
            flat
            class="q-pa-xs"
            label="Confirmer l'inscription"
            color="blue-8"
            size="sm"
            @click="$emit('setState', 5)"
          />
        </div>
      </div>
      <div class="row rounded-borders q-pa-md bg-white q-mb-md">
        <div class="col-12 text-subtitle1 text-weight-bold q-mb-lg">Informations du client</div>
        <div v-if="selectedRow.image" class="col-4">
          <div >
            <q-img
              bordered
              class="rounded-borders q-mt-dm q-mb-sm bordered"
              :ratio="1"
              style="width: 150px"
              :src="$axios.defaults.baseURL.replace('api', 'images')+selectedRow.image"
            ></q-img>
          </div>
        </div>
        <div class="col-12">
          <div class="row">
            <q-input
              class="q-mt-dm q-mb-sm"
              borderless
              v-model="selectedRow.last_name"
              label="Nom"
              dense
              readonly
            />
            <q-input
              class="q-mt-dm q-mb-sm"
              borderless
              v-model="selectedRow.first_name"
              label="Prénom"
              dense
              readonly
            />
            <q-input
              class="q-mt-dm q-mb-sm"
              borderless
              v-model="selectedRow.email"
              label="Email"
              dense
              readonly
            />
            <q-input
              class="q-mt-dm q-mb-sm"
              borderless
              v-model="selectedRow.phone"
              label="Téléphone"
              dense
              readonly
            />
            <q-input
              class="q-mt-dm q-mb-sm"
              borderless
              v-model="selectedRow.activity"
              label="Activité"
              dense
              readonly
            />
            <q-input
              class="q-mt-dm q-mb-sm"
              borderless
              v-model="selectedRow.category"
              label="Catégorie"
              dense
              readonly
            />
          </div>
        </div>
        <div class="col-12 q-mt-md q-mb-md">
          <q-separator horizontal/>
        </div>
        <div class="col-12 text-subtitle1 text-weight-bold q-mt-sm q-mb-sm">Géolocalisation</div>
        <q-input
          class="q-mt-dm q-mb-sm"
          borderless
          v-model="selectedRow.latitude"
          label="Latitude"
          dense
          stack-label
          readonly
        />
        <q-input
          class="q-mt-dm q-mb-sm"
          borderless
          v-model="selectedRow.longtitude"
          label="Longtitude"
          dense
          stack-label
          readonly
        />
      </div>
      <q-form @submit="saveContract" ref="form">
        <q-card class="no-shadow">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Contrat</div>
            <div class="row">
              <div class="col-6 q-pa-sm">
                <q-select
                  v-model="paymentMode"
                  :options="paymentModes"
                  label="mode de paiement"
                  filled
                  dense
                  :rules="[val => !!val || 'Ce champ est obligatoire']"
                />
              </div>
              <div class="col-6 q-pa-sm">
                <q-select
                  v-model="paymentDeadline"
                  :options="paymentDeadlines"
                  label="délai de paiement"
                  filled
                  dense
                  :rules="[val => !!val || 'Ce champ est obligatoire']"
                />
              </div>
            </div>
            <div class="row">
              <div class="col-6 q-pa-sm">
                <q-select
                  v-model="maxDebt"
                  :options="maxDebts"
                  label="max solde"
                  dense
                  filled
                  :rules="[val => !!val || 'Ce champ est obligatoire']"
                />
              </div>
            </div>
            <div class="row">
              <div class="col-12 text-subtitle2 text-weight-bold text-left q-pa-sm">Livraison</div>
              <div class="col-12 text-left">
                <q-radio v-model="shipping" :val="1" label="Oui"/>
              </div>
              <div class="col-12 text-left">
                <q-radio v-model="shipping" :val="0" label="Non"/>
              </div>
            </div>
            <div class="row">
              <div class="col-12 q-pa-sm text-right">
                <q-btn
                  type="submit"
                  flat
                  size="sm"
                  class="text-weight-bold bg-blue-1 q-pa-xs"
                  color="blue-10"
                  label="Mettre à jour"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'customerCard',
  props: ['selectedRow'],
  data () {
    return {
      shipping: null,
      paymentMode: null,
      paymentDeadline: null,
      maxDebt: null,
      paymentModes: [],
      paymentDeadlines: [],
      maxDebts: []
    }
  },
  mounted () {
    this.getPaymentModes()
    this.getPaymentDeadlines()
    this.getMaxDebts()

    this.shipping = this.selectedRow.shipping
  },
  methods: {
    saveContract () {
      this.$refs.form.validate().then(success => {
        if (success) {
          this.$axios
            .post('/updateContract', {
              customer_id: this.selectedRow.id,
              shipping: this.shipping,
              payment_mode_id: this.paymentMode.id,
              payment_deadline_id: this.paymentDeadline.id,
              max_debt_id: this.maxDebt.id
            })
            .then(res => {
              this.$q.notify({
                color: 'blue-10',
                message: 'Le contrat a été modifié avec succés'
              })
            })
        }
      })
    },
    getPaymentModes () {
      this.$axios.get('/getPaymentMode').then(res => {
        this.paymentModes = res.data
        this.paymentMode = this.paymentModes.find(
          el => el.id === this.selectedRow.payment_mode_id
        )
      })
    },
    getPaymentDeadlines () {
      this.$axios.get('/getPaymentDeadline').then(res => {
        this.paymentDeadlines = res.data
        this.paymentDeadline = this.paymentDeadlines.find(
          el => el.id === this.selectedRow.payment_deadline_id
        )
      })
    },
    getMaxDebts () {
      this.$axios.get('/getMaxDebt').then(res => {
        this.maxDebts = res.data
        this.maxDebt = this.maxDebts.find(
          el => el.id === this.selectedRow.max_debt_id
        )
      })
    }
  }
}
</script>
