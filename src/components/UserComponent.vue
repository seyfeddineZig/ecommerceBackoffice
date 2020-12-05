<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 500px; max-width: 80vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ recordToEdit === null ? 'Nouvel utilisateur' : 'Modifier utilisateur' }}</div>
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
          <div class="col-12">
            <div class="row">
              <div class="col-6 q-pa-sm">
                <q-input
                  filled
                  v-model="fields.last_name"
                  label="Nom *"
                  hint="Nom de famille"
                  dense
                  :rules="[val => !!val || 'Ce champ est obligatoire']"
                />
              </div>
              <div class="col-6 q-pa-sm">
                <q-input
                  filled
                  v-model="fields.first_name"
                  label="Prénom *"
                  hint="Prénom"
                  dense
                  :rules="[val => !!val || 'Ce champ est obligatoire']"
                />
              </div>
              <div class="col-6 q-pa-sm">
                <q-input
                  filled
                  v-model="fields.email"
                  label="Email *"
                  type="email"
                  hint="Nom d'utilisateur'"
                  dense
                  :rules="[val => !!val || 'Ce champ est obligatoire']"
                />
              </div>
              <div class="col-6 q-pa-sm">
                <q-select
                  v-model="fields.group"
                  dense
                  :options="groupOptions"
                  label="Groupe *"
                  hint="Groupe d'utilisateur"
                  filled
                />
              </div>
              <q-separator class="q-mt-md q-mb-md" horizontal/>
              <div v-if="recordToEdit !== null" class="col-12 q-pa-sm text-grey-8 text-caption">
                  Laissez ces champs vides si vous ne voulez pas changer le mot de passe.
              </div>
              <div class="col-6 q-pa-sm">
                <q-input
                  filled
                  v-model="fields.password"
                  label="Mot de passe"
                  type="password"
                  hint="Mot de passe"
                  ref="pwd"
                  dense
                  v-bind:rules="pwdRequired"
                />
              </div>
              <div class="col-6 q-pa-sm">
                <q-input
                  filled
                  v-model="fields.confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  hint="confirmer le mot de passe"
                  dense
                  v-bind:rules="ConfirmPWD"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="row q-pb-sm">
          <div class="col-12 text-right q-gutter-sm">
            <q-btn
              type="submit"
              label="enregistrer"
              class="q-pa-xs bg-blue-10"
              color="white"
              size="sm"
              icon="far fa-save"
              :disable="loading?true:false"
            >
              <div v-if="loading" class="col-12 justify-center">
                <q-circular-progress
                  indeterminate
                  size="16px"
                  :thickness=".3"
                  color="grey-1"
                  track-color="transparent"
                />
              </div>
            </q-btn>
          </div>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'CreateUserCroupComponent',
  props: ['recordToEdit', 'groups', 'dialog'],
  data () {
    return {
      loading: false,
      fields: {}
    }
  },
  watch: {
    dialog: function (val) {
      if (val) {
        this.initFields()
      }
    }
  },
  computed: {
    groupOptions () {
      return this.groups
    },
    ConfirmPWD () {
      return [
        v =>
          v === this.$refs.pwd.value || 'Mots de passe différents'
      ]
    },
    pwdRequired () {
      if (this.recordToEdit !== null) return false
      return [
        v => !!v || 'Ce champ est obligatoire'
      ]
    }
  },
  mounted () {
    this.initFields()
  },
  methods: {
    initFields () {
      const fields = {}
      this.loading = false

      if (this.recordToEdit === null) {
        fields.first_name = ''
        fields.last_name = ''
        fields.email = ''
        fields.password = ''
        fields.confirmPassword = ''
        fields.group = null
      } else {
        fields.first_name = this.recordToEdit.first_name
        fields.last_name = this.recordToEdit.last_name
        fields.email = this.recordToEdit.email
        fields.password = ''
        fields.confirmPassword = ''
        fields.group = this.groupOptions.find(
          el => parseInt(el.id) === parseInt(this.recordToEdit.user_group_id)
        )
      }
      this.fields = fields
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

          data.append('first_name', this.fields.first_name)
          data.append('last_name', this.fields.last_name)
          data.append('email', this.fields.email)
          data.append('password', this.fields.password)
          data.append('group_id', this.fields.group.id)

          this.$axios
            .post(
              'user' +
                (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                type: 'success',
                message: 'L\'utilisateur a été créé avec succés !'
              })
              const data = {
                ...res.data
              }
              this.$emit('updateTableRows', data)
            })
            .catch(err => {
              this.loading = false
              let message = ''
              if (err.response.status === 401) {
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
