<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 700px; max-width: 80vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ ( recordToEdit === null ? 'Nouvelle ' : 'Modifier ') + (type === 'category' ? 'catégorie' : 'sous catégorie') }}</div>
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
                    <div v-if="type === 'subCategory'" class="col q-pa-md">
                      <q-select
                        style="width: 100%;"
                        filled
                        dense
                        v-model="parentId"
                        use-input
                        hide-selected
                        fill-input
                        label="Catégorie"
                        input-debounce="0"
                        :options="options"
                        @filter="filterFn"
                        :readonly="selectedProductCategory !== null"
                      >
                        <template v-slot:before>
                          <q-icon name="account_tree"/>
                        </template>
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">Aucun résultat</q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                    <div class="col q-pa-md">
                      <q-file
                        v-model="image"
                        filled
                        dense
                        label="Image de la catégorie"
                        :filter="checkFileType"
                        @rejected="onRejected"
                      >
                        <template v-slot:before>
                          <q-icon
                            v-if="recordToEdit === null || image !== null  || recordToEdit.image === null"
                            name="attach_file"
                          />
                          <q-avatar rounded size="md" v-else>
                            <img
                              :src="$axios.defaults.baseURL.replace('api', 'images') + recordToEdit.image"
                            >
                          </q-avatar>
                        </template>
                      </q-file>
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
              <SEO
                :fields="fields"
                :langs="langs"
              ></SEO>
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
import SEO from './SEO'
import MultilangContent from './MultilangContent'
export default {
  name: 'CreateProductCategoryComponent',
  props: ['recordToEdit', 'dialog', 'categories', 'type', 'selectedProductCategory'],
  data () {
    return {
      loading: false,
      image: null,
      isActif: true,
      fields: {},
      langs: [],
      parentId: null,
      options: []
    }
  },
  components: { SEO, MultilangContent },
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
      this.image = null

      if (this.recordToEdit === null) {
        this.parentId = null
        this.isActif = true
        this.parentId = this.type === 'subCategory' ? this.selectedProductCategory || null : null
        this.langs.forEach(element => {
          fields[element.id] = {
            lang_id: element.id,
            name: '',
            description: '',
            page_title: '',
            meta_description: '',
            meta_keywords: ''
          }
        })
      } else {
        this.isActif = this.recordToEdit.is_activated === 1
        this.parentId = this.categories.find(
          el => el.id === this.recordToEdit.product_category_id
        )
        this.recordToEdit.fields.forEach(element => {
          fields[element.lang_id] = {
            lang_id: element.lang_id,
            name: element.name,
            description: element.description,
            page_title: element.page_title,
            meta_description: element.meta_description,
            meta_keywords: element.meta_keywords
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
          if (this.image) {
            data.append('image', this.image)
          }

          if (this.parentId) {
            data.append('product_category_id', this.parentId.id)
          }

          data.append('is_activated', this.isActif ? 1 : 0)

          this.$axios
            .post(
              'productCategory' +
                (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                color: 'blue-10',
                message:
                  'La catégorie a été ' +
                  (method === 'post' ? 'créé' : 'modifiée') +
                  ' avec succés !'
              })
              const obj = {
                lang_id: 1,
                name: this.fields[1].name,
                label: this.fields[1].name,
                description: this.fields[1].description,
                page_title: this.fields[1].page_title,
                meta_description: this.fields[1].meta_description,
                meta_keywords: this.fields[1].meta_keywords,
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
    },

    filterFn (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.options = this.categories.filter(
          v =>
            v.label.toLowerCase().indexOf(needle) > -1 &&
            (this.recordToEdit === null || v.id !== this.recordToEdit.id)
        )
      })
    }
  }
}
</script>
