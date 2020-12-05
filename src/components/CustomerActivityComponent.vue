<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 700px; max-width: 80vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ recordToEdit === null ? 'Nouvelle activité' : 'Modifier activité' }}</div>
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
              <MultilangContent :fields="fields" :langs="langs"></MultilangContent>
              <q-expansion-item
                expand-icon-toggle
                expand-separator
                label="Informations partagées"
                default-opened
              >
          <div class="col-md-12">
            <div class="row">
              <div class="col q-pa-md">
                <q-toggle
                  size="sm"
                  v-model="isActif"
                  color="blue-10"
                  label="Afficher sur le site ?"
                />
              </div>
            </div>
          </div>
          </q-expansion-item>
            </q-list>
        </div>
        </div>

        <div class="row">
          <div class="col-12 text-right q-gutter-sm q-pt-md q-pb-sm">
            <q-btn
              label="Annuler"
              type="button"
              color="grey-10"
              size="sm"
              class="q-pa-xs"
              @click="$emit('closeDialog')"
            />
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
import MultilangContent from './MultilangContent'
export default {
  name: 'CreateCustomerActivityComponent',
  props: ['recordToEdit', 'dialog'],
  data () {
    return {
      loading: false,
      isActif: true,
      fields: {},
      langs: [],
      options: []
    }
  },
  watch: {
    dialog: function (val) {
      if (val) {
        this.initFields()
      }
    }
  },
  components: { MultilangContent },

  mounted () {
    this.langs = this.$store.getters['config/getLangs']
    this.initFields()
  },
  methods: {
    initFields () {
      const fields = {}
      this.loading = false

      if (this.recordToEdit === null) {
        this.isActif = true

        this.langs.forEach(element => {
          fields[element.id] = {
            lang_id: element.id,
            name: '',
            description: ''
          }
        })
      } else {
        this.isActif = this.recordToEdit.is_activated === 1
        this.recordToEdit.fields.forEach(element => {
          fields[element.lang_id] = {
            lang_id: element.lang_id,
            name: element.name,
            description: element.description
          }
        })
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
          data.append('rows', JSON.stringify(this.fields))
          data.append('is_activated', this.isActif ? 1 : 0)

          this.$axios
            .post(
              'customerActivity' +
                (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                type: 'success',
                message:
                  'L\'activité a été ' +
                  (method === 'post' ? 'créé' : 'modifiée') +
                  ' avec succés !'
              })
              const obj = {
                lang_id: 1,
                name: this.fields[1].name,
                label: this.fields[1].name,
                description: this.fields[1].description,
                ...res.data[0],
                is_activated: this.isActif ? 1 : 0
              }
              if (method === 'put') {
                obj.created_by = this.recordToEdit.created_by
              }
              this.$emit('updateTableRows', obj)
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
