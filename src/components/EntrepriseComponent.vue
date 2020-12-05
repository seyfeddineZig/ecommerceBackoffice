<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <div class="text-h6 text-weight-bold">
      Entreprise
    </div>
    <div class="row">
      <div class="col-md-5 col-sm-12 col-xs-12 q-mb-sm">
        <q-input dense filled v-model="name" type="text" label="Raison sociale"/>
      </div>
    </div>
    <div class="row">
      <div class="col-md-8 col-sm-12 col-xs-12 q-mb-sm">
        <q-input dense filled v-model="adress" type="text" label="Adresse"/>
      </div>
    </div>
    <div class="row">
      <div class="col-md-5 col-sm-12 col-xs-12 q-mb-sm">
        <q-input dense filled v-model="phone" type="text" label="Téléphone"/>
      </div>
    </div>
    <div class="row">
      <div class="col-md-5 col-sm-12 col-xs-12 q-mb-sm">
        <q-input dense filled v-model="email" type="email" label="Email"/>
      </div>
    </div>
    <div>
      <q-btn label="Enregister" type="submit" class="q-pa-sm" color="blue-10" size="sm"/>
    </div>
  </q-form>
</template>

<script>
export default {
  name: 'EntrepriseComponent',
  data () {
    return {
      name: '',
      adress: '',
      email: '',
      phone: ''
    }
  },
  mounted () {
    this.getEntrepriseData()
  },
  methods: {
    getEntrepriseData () {
      this.$axios.get('/entreprise').then(res => {
        this.name = res.data.name
        this.email = res.data.email
        this.phone = res.data.phone
        this.adress = res.data.adress
      })
    },
    onSubmit () {
      this.$axios
        .post('/entreprise', {
          email: this.email,
          name: this.name,
          phone: this.phone,
          adress: this.adress
        })
        .then(res => {
          this.$q.notify({
            color: 'blue-10',
            message:
              "les informations de l'entreprise ont été changé avec succés !"
          })
        })
    }
  }
}
</script>
