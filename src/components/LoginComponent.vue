<template>
  <div class="row">
    <div class="col col-md-4 offset-md-4 q-pa-lg">
      <q-form ref="form" @submit="onSubmit">
        <div class="q-gutter-sm">
          <q-banner v-if="error" rounded inline-actions class="text-red bg-red-1">
            <div class="text-caption">{{ error }}</div>

            <template v-slot:action>
              <q-btn flat color="red" size="sm" @click="error = ''">
                <q-icon name="fas fa-times" style="font-size: 1.2em;" />
              </q-btn>
            </template>
          </q-banner>
          <q-input
            filled
            v-model="email"
            type="text"
            label="Email"
            :rules="[val => !!val || 'Ce champ est obligatoire']"
          />
          <q-input
            filled
            v-model="password"
            type="password"
            label="Mot de passe"
            :rules="[val => !!val || 'Ce champ est obligatoire']"
          />
          <q-btn class="blue-10" :disable="loading?true:false" type="submit">
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
            <div class="text-caption">Connexion</div>
          </q-btn>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthComponent',
  data () {
    return {
      email: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  computed: {
  },
  methods: {
    onSubmit () {
      this.loading = true
      this.$refs.form.validate().then(success => {
        if (success) {
          const data = {
            email: this.email,
            password: this.password
          }
          this.$axios
            .post('login', data)
            .then(res => {
              if (res) {
                localStorage.setItem('TOKEN', res.data.token)
                this.$axios.defaults.headers.common.Authorization = 'Bearer ' + res.data.token
                this.$router.push('/')
              }
            })
            .catch(err => {
              this.error = err.response.data.errors.email[0]
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
