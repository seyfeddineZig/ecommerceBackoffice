<template>
  <q-dialog v-model="dialog" persistent>
    <q-card class="bg-grey-1 text-grey-10" style="width: 50vw; max-width: 50vw">
      <q-form v-if="!fetched" @submit="onSubmit" class="q-gutter-md">
        <q-card-section class="bg-grey-1 no-padding">
          <div class="row q-pa-sm">
            <div class="col-6">
              <div class="text-subtitle1 q-pl-sm"></div>
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
        </q-card-section>

        <q-card-section style="max-height: 73vh" class="scroll q-pa-sm q-mb-md">
          <q-list bordered>
            <q-expansion-item
              expand-separator
              header-class="text-bold bg-grey-2"
              default-opened
              label="Importer les fichiers Excel"
              caption="Choisir les fichiers qui contient la liste des produits selon la langue puis affecter chaque colonne à un son attribut."
            >
              <div class="row q-pa-md bg-grey-2 q-mt-lg q-mb-lg text-center">
                <div class="col q-pa-sm" v-for="l in xlsFiles" :key="l.id">
                  <q-file
                    dense
                    filled
                    v-model="l.file"
                    :label=" l.full_name "
                    :filter="checkFileType"
                    @rejected="onRejected"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fas fa-file-excel"/>
                    </template>
                  </q-file>
                </div>
                <div v-if="hiddenByClientOrder" class="col q-pa-sm">
                  <q-btn round color="blue-10" type="submit" size="sm" icon="check"/>
                </div>
              </div>
            </q-expansion-item>
            <q-expansion-item
              v-if="hiddenByClientOrder"
              expand-separator
              header-class="text-bold bg-grey-2"
              label="Informations générales des produit"
              default-opened
            >
              <div v-if="fetched" class="row">
                <div class="col-12 text-subtitle2"></div>
                <div v-for="p in productFields" :key="p.name" class="col-3 q-pa-sm">
                  <q-select dense v-model="p.value" :options="options" :label="p.label" filled>
                    <template v-slot:append>
                      <q-icon
                        v-if="p.value !== null"
                        class="cursor-pointer"
                        name="clear"
                        @click.stop="p.value = null"
                      />
                    </template>
                  </q-select>
                </div>
              </div>
            </q-expansion-item>
            <q-expansion-item
              v-if="hiddenByClientOrder"
              expand-separator
              label="Tarification"
              header-class="text-bold bg-grey-2"
              default-opened
            >
              <div v-if="fetched" class="row">
                <div v-for="p in pricing" :key="p.id" class="col q-pa-sm">
                  <q-select dense filled v-model="p.value" :options="options" :label="p.name">
                    <template v-slot:append>
                      <q-icon
                        v-if="p.value !== null"
                        class="cursor-pointer"
                        name="clear"
                        @click.stop="p.value = null"
                      />
                    </template>
                  </q-select>
                </div>
              </div>
            </q-expansion-item>
            <q-expansion-item
              v-if="hiddenByClientOrder"
              expand-separator
              label="Caractéristiques du produit"
              header-class="text-bold bg-grey-2"
              default-opened
            >
              <div v-if="fetched" class="row">
                <div class="col-12 q-mb-sm q-pa-sm text-caption">
                  Ajouter une caractéristique puis choisir la colonne qui la convient
                  <q-btn round color="blue-10" size="sm" icon="add" @click="addAttribute"/>
                </div>
                <div
                  v-for="a in selectedAttributes"
                  :key="selectedAttributes.indexOf(a)"
                  class="col-6"
                >
                  <div class="row bg-grey-2 q-pa-sm q-ma-xs">
                    <div class="col-5 q-pa-sm">
                      <q-select
                        dense
                        v-model="a.attribute"
                        :options="attributes_options"
                        label="caractéristique"
                        filled
                      >
                        <template v-slot:append>
                          <q-icon
                            v-if="a.attribute !== null"
                            class="cursor-pointer"
                            name="clear"
                            @click.stop="a.attribute = null"
                          />
                        </template>
                      </q-select>
                    </div>
                    <div class="col-5 q-pa-sm">
                      <q-select dense v-model="a.value" :options="options" label="colonne" filled/>
                    </div>
                    <div class="col-1 q-pa-sm">
                      <q-btn
                        color="grey-2"
                        round
                        flat
                        text-color="grey-10"
                        icon="remove"
                        @click="selectedAttributes.splice(selectedAttributes.indexOf(a), 1)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-expansion-item>
          </q-list>
        </q-card-section>
        <q-card-actions class="bg-grey-2" align="right">
          <q-btn
            v-if="hiddenByClientOrder"
            type="button"
            label="Réintialiser"
            flat
            class="q-pa-xs bg-grey-2"
            color="grey-10"
            size="sm"
            @click="fetched= false"
          ></q-btn>
          <q-btn
            type="submit"
            label="Importer"
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
        </q-card-actions>
      </q-form>
    </q-card>
    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div
            class="text-subtitle2 text-weight-bold text-center"
          >{{ listOfExistantProducts.length }} codes/references existent déja, voulez vous continuer l'importation</div>
          <div>
            <div
              v-for="(p, i) in listOfExistantProducts"
              :key="i"
              class="text-caption q-ml-sm"
            >{{ p }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            class="bg-grey-1 text-weight-bold q-pa-xs"
            size="sm"
            label="Annuler"
            color="grey-10"
            @click="confirm = false; $emit('closeDialog')"
          />
          <q-btn
            flat
            class="bg-blue-2 text-weight-bold q-pa-xs"
            size="sm"
            label="Continuer"
            color="blue-10"
            @click="onSubmit();"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script>
export default {
  props: ['dialog', 'attributes', 'pricing', 'langs', 'xlsFiles'],
  data () {
    return {
      loading: false,
      confirm: false,
      cols: [],
      hiddenByClientOrder: false,
      listOfExistantProducts: [],
      productFields: [
        { name: 'category', label: 'Catégorie', value: null, required: true },
        {
          name: 'sub_category',
          label: 'Sous-catégorie',
          value: null,
          required: true
        },
        { name: 'name', label: 'Titre', value: null, required: true },
        { name: 'brand', label: 'Marque', value: null, required: true },
        { name: 'code', label: 'Code', value: null, required: true },
        { name: 'reference', label: 'Référence', value: null, required: true },
        {
          name: 'bar_code',
          label: 'Code à barre',
          value: null,
          required: true
        },
        {
          name: 'description',
          label: 'Petite description',
          value: null,
          required: false
        },
        {
          name: 'detailed_description',
          label: 'Description detaillé',
          value: null,
          required: false
        },
        { name: 'guarantee', label: 'Garantie', value: null, required: true }
      ],
      selectedAttributes: [],
      fetched: false
    }
  },
  computed: {
    options () {
      return this.cols.map(e => ({
        ...e,
        disable:
          this.productFields.findIndex(
            el => el.value && el.value.label === e.label
          ) !== -1 ||
          this.selectedAttributes.findIndex(
            el => el.value && el.value.label === e.label
          ) !== -1 ||
          this.pricing.findIndex(
            el => el.value && el.value.label === e.label
          ) !== -1
      }))
    },
    attributes_options () {
      return this.attributes.filter(
        el =>
          this.selectedAttributes.findIndex(
            e => e.attribute && e.attribute.id === el.id
          ) === -1
      )
    }
  },
  methods: {
    addAttribute () {
      this.selectedAttributes.push({
        attribute: null,
        value: null
      })
    },
    loadFiles () {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      const data = new FormData()
      this.xlsFiles.forEach(el => {
        data.append('file_' + el.id, el.file)
      })

      this.$axios
        .post('/loadProductFiles', data, config)
        .then(res => {
          this.cols = res.data.map((col, i) => ({
            index: i,
            label: col
          }))
          this.productFields.forEach(element => {
            const colIndex = this.cols.findIndex(
              e =>
                e.label
                  .toLowerCase()
                  .split(' ')
                  .join('') ===
                element.label
                  .toLowerCase()
                  .split(' ')
                  .join('')
            )
            if (colIndex !== -1) {
              element.value = this.cols[colIndex]
            }
            this.fetched = true
          })
        })
        .catch(err => {
          let message = 'Une erreur est survenue au serveur'
          if (
            err.response.status === 500 &&
            err.response.data.err !== undefined
          ) {
            message = err.response.data.err
          }
          this.$q.notify({
            type: 'negative',
            message: message
          })
        })
    },
    checkFileType (files) {
      return files.filter(
        file =>
          file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    },

    onRejected (rejectedEntries) {
      this.$q.notify({
        type: 'negative',
        message: 'Veuillez choisir un fichier Excel'
      })
    },
    onSubmit () {
      const errMsg = ''
      /* if (!this.fetched) {
        errMsg = 'Veuillez choisir les fichiers'
      } else {
        this.productFields.forEach(element => {
          if (!element.value && element.required && errMsg === '') {
            errMsg = 'Le champ ' + element.label + ' est obligatoire'
          }
        })
      } */
      if (errMsg !== '') {
        this.$q.notify({
          type: 'negative',
          message: errMsg
        })
      } else {
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
        const data = new FormData()
        this.xlsFiles.forEach(el => {
          data.append('file_' + el.id, el.file)
        })
        const productFields = {}
        this.productFields.forEach(el => {
          productFields[el.name] = el.value ? el.value.index : null
        })
        data.append('product_fields', JSON.stringify(productFields))
        data.append(
          'product_attributes',
          JSON.stringify(
            this.selectedAttributes.map(obj => ({
              col_index: obj.value ? obj.value.index : null,
              attribute_id: obj.attribute.id
            }))
          )
        )
        data.append(
          'pricing',
          JSON.stringify(
            this.pricing.map(obj => ({
              col_index: obj.value ? obj.value.index : null,
              pricing_id: obj.id
            }))
          )
        )

        data.append('force_importation', this.confirm)

        this.$axios
          .post('/importProductFiles', data, config)
          .then(res => {
            if (res.data.exist_list) {
              this.listOfExistantProducts = res.data.exist_list
              this.confirm = true
            } else {
              this.$q.notify({
                type: 'positive',
                message:
                  "l'importation des fichiers a été effectué avec succés !"
              })
              this.confirm = false
              this.$emit('reloadProducts')
              this.$emit('closeDialog')
            }
          })
          .catch(() => {
            this.$q.notify({
              type: 'negative',
              message:
                "Une erreur a été survenue lors l'importation du fichier."
            })
          })
      }
    }
  }
}
</script>
