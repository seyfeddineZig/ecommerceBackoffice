<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 600px; max-width: 80vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ recordToEdit === null ? 'Nouveau tarif de livraison' : 'Modifier tarif' }}</div>
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
              <MultilangContent :shipping="true" :fields="fields" :langs="langs"></MultilangContent>
              <q-expansion-item
                expand-icon-toggle
                expand-separator
                label="Informations partagées"
                default-opened
              >
                <div class="col-md-12">
                  <div class="row">
                    <div class="col q-pa-md">
                      <q-input
                        dense
                        filled
                        v-model="code"
                        type="text"
                        label="Code"
                        :rules="[val => !!val || 'Ce champ est obligatoire']"
                      />
                    </div>
                    <div class="col q-pa-md">
                      <q-input
                        dense
                        filled
                        v-model="amount"
                        type="number"
                        label="Tarif"
                        :rules="[val => !!val || 'Ce champ est obligatoire']"
                      />
                    </div>
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
import MultilangContent from './MultilangContent'
export default {
  name: 'CreateBrandComponent',
  props: ['recordToEdit', 'dialog'],
  data () {
    return {
      loading: false,
      amount: null,
      code: null,
      isActif: true,
      fields: {},
      langs: []
    }
  },
  components: { MultilangContent },
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
        this.isActif = true
        this.amount = null
        this.code = null
        this.langs.forEach(element => {
          fields[element.id] = {
            lang_id: element.id,
            name: ''
          }
        })
      } else {
        this.isActif = this.recordToEdit.is_activated === 1
        this.amount = this.recordToEdit.amount
        this.code = this.recordToEdit.code

        this.recordToEdit.fields.forEach(element => {
          fields[element.lang_id] = {
            lang_id: element.lang_id,
            name: element.name
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
          data.append('amount', this.amount)
          data.append('code', this.code)

          this.$axios
            .post(
              'shippingFee' +
                (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                type: 'success',
                message: 'Le tarif a été crée avec succés !'
              })
              const obj = {
                lang_id: 1,
                name: this.fields[1].name,
                label: this.fields[1].name,
                ...res.data,
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
