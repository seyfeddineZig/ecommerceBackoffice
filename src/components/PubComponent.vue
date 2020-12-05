<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 400px; max-width: 60vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm text-weight-bold"
            >{{ recordToEdit === null ? 'Nouvelle publicité' : 'Modifier publicité' }}</div>
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
              <div class="col-12 q-pa-md">
                <q-select v-model="type" :options="types" label="Type" dense filled
                             :rules="[val => !!val || 'Ce champ est obligatoire']"
/>
              </div>
              <div class="col-12 q-pa-md">
                <q-select v-model="position" :options="positions" label="Position" dense filled
                :rules="[val => !!val || 'Ce champ est obligatoire']"/>
              </div>
              <div class="col-12 q-pa-md">
                <q-input filled dense v-model="link" type="text" label="Lien" autogrow
                v-bind:rules="linkRequired"/>
              </div>
              <div v-if="type && type.name === 'IMAGE'" class="col-12 q-pa-md">
                <q-file
                  v-model="image"
                  borderless
                  dense
                  label="Choisir une image"
                  :filter="checkFileType"
                  @rejected="onRejected"
                >
                  <template v-slot:before>
                    <q-icon
                      v-if="recordToEdit === null || image !== null  || recordToEdit.image === null"
                      name="eva-attach-2-outline"
                    />
                    <q-avatar rounded size="md" v-else>
                      <img
                        :src="$axios.defaults.baseURL.replace('api', 'images') + recordToEdit.image"
                      >
                    </q-avatar>
                  </template>
                </q-file>
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
  name: 'CreatePubComponent',
  props: ['recordToEdit', 'dialog'],
  data () {
    return {
      positions: [
        { label: 'En haut', name: 'TOP' },
        { label: 'En bas', name: 'BOTTOM' },
        { label: 'à gauche', name: 'LEFT' },
        { label: 'à droite', name: 'RIGHT' },
        { label: 'dans le slide', name: 'CAROUSEL' }
      ],
      types: [
        { label: 'Image', name: 'IMAGE' },
        { label: 'Video', name: 'VIDEO' }
      ],
      loading: false,
      image: null,
      type: null,
      position: null,
      link: null
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
    linkRequired () {
      return [
        v =>
          ((this.type && this.type.name === 'VIDEO' && !!v) || (this.type && this.type.name === 'IMAGE')) || 'Le champ lien est obligatoire si le type est video'
      ]
    }
  },
  mounted () {
    this.langs = this.$store.getters['config/getLangs']
    this.initFields()
  },
  methods: {
    initFields () {
      this.loading = false
      this.image = null

      if (this.recordToEdit === null) {
        this.type = null
        this.position = null
        this.link = null
      } else {
        this.type = this.types.find(el => el.name === this.recordToEdit.type)
        this.position = this.positions.find(el => el.name === this.recordToEdit.position)
        this.link = this.recordToEdit.link
      }
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

          if (this.image) {
            data.append('image', this.image)
          }

          data.append('type', this.type.name)
          data.append('link', this.link)
          data.append('position', this.position.name)

          this.$axios
            .post(
              'pub' + (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                type: 'success',
                message: 'La publicité a été crée avec succés !'
              })

              this.$emit('updateTableRows', res.data)
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
    },
    checkFileType (files) {
      return files.filter(
        file =>
          file.type === 'image/png' ||
          file.type === 'image/jpg' ||
          file.type === 'image/jpeg'
      )
    },

    onRejected (rejectedEntries) {
      this.$q.notify({
        type: 'negative',
        message: 'Le champ image doit être un fichier de type : jpeg, jpg, png.'
      })
    }
  }
}
</script>
