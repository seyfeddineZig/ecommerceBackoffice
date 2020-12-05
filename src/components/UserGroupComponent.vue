<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 700px; max-width: 80vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ recordToEdit === null ? 'Nouveau groupe' : 'Modifier groupe' }}</div>
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
            <q-list bordered class="rounded-borders">
              <q-expansion-item expand-separator icon label caption default-opened>
                <div class="row">
                  <div class="col-12 q-pa-sm">
                    <q-input
                      filled
                      class="q-mt-sm q-mb-sm"
                      v-model="fields.name"
                      label="Désignation"
                      dense
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    />
                    <q-input
                      filled
                      class="q-mt-sm q-mb-sm"
                      v-model="fields.description"
                      label="Description"
                      type="textarea"
                      dense
                    />
                  </div>
                </div>
              </q-expansion-item>
              <q-expansion-item expand-icon-toggle expand-separator label="Privilèges">
                <RolesCard :roles="roles" :disable="recordToEdit !== null && recordToEdit.id === 1"></RolesCard>
              </q-expansion-item>
            </q-list>
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
import RolesCard from './Roles'

export default {
  name: 'CreateUserCroupComponent',
  props: ['recordToEdit', 'roles', 'dialog'],
  data () {
    return {
      loading: false,
      image: null,
      fields: {},
      langs: []
    }
  },
  components: { RolesCard },
  watch: {
    dialog: function (val) {
      if (val) {
        this.initFields()
      }
    }
  },
  mounted () {
    this.langs = this.$store.getters['config/getLangs']
    this.initFields()
  },
  methods: {
    initFields () {
      const fields = {}
      this.loading = false

      if (this.recordToEdit === null) {
        fields.name = ''
        fields.description = ''
      } else {
        fields.name = this.recordToEdit.name
        fields.description = this.recordToEdit.description
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

          data.append('name', this.fields.name)
          data.append('description', this.fields.description)
          const roles = []
          this.roles.forEach(el => {
            el.roles.filter(e => e.checked).forEach(e => {
              roles.push(e.id)
            })
          })
          data.append(
            'roles',
            JSON.stringify(
              roles
            )
          )
          this.$axios
            .post(
              'userGroup' + (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                type: 'success',
                message: 'Le groupe a été créé avec succés !'
              })
              const data = {
                ...res.data,
                roles: roles
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
