<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 700px; max-width: 80vw;">
      <q-form ref="form" @submit="onSubmit">
        <div class="row q-pa-sm">
          <div class="col-6">
            <div
              class="text-subtitle1 q-pl-sm"
            >{{ recordToEdit === null ? 'Nouvelle caracteristique' : 'Modifier caracteristique' }}</div>
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
                label="Valeurs de caractéristique"
                default-opened
              >
                <div class="col-md-12">
                  <!--<div class="row">
                    <div class="col-6 q-pl-md q-pr-md">
                      <q-select
                        style="width: 100%"
                        dense
                        v-model="attributeType"
                        :options="options"
                        @input="attributeValues = []"
                        label="Type de la caracteristique"
                        filled
                      />
                    </div>
                  </div>-->
                  <div class="row q-mt-sm">
                    <div v-for="(l, i) in langs" :key="i" class="col-5 q-pl-md q-pr-md">
                      <q-input
                        filled
                        bottom-slots
                        v-model="attributeValue[l.id]"
                        :label="'Ajouter une valeur (' + l.short_name + ')'"
                        :readonly="!(attributeType === 'Texte')"
                        dense
                      >
                        <template v-slot:hint>
                          {{
                          attributeValueHint === '' ? 'Ajouter une valeur à la caracteristique, Ex: S,M,L,XL..'
                          : (attributeValueHint === 'empty' ? 'Veuillez saisir une valeur' : 'Cette valeur existe déja !')
                          }}
                        </template>
                        <template v-if="attributeType === 'Couleurs'" v-slot:prepend>
                          <q-avatar v-bind:style="{'background': attributeValue[l.id]}"/>
                        </template>
                        <template v-slot:append>
                          <q-icon
                            name="colorize"
                            v-if="attributeType === 'Couleurs'"
                            class="cursor-pointer"
                          >
                            <q-popup-proxy transition-show="scale" transition-hide="scale">
                              <q-color v-model="attributeValue[l.id]"/>
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="col-1">
                      <q-btn
                        size="sm"
                        dense
                        color="blue-10"
                        icon="add"
                        label="ajouter"
                        @click="addAttributeValue()"
                      />
                    </div>
                  </div>
                  <div
                    v-if="oldAttributeValues.length > 0 || attributeValues.length > 0"
                    class="row"
                  >
                    <div v-for="(l, j) in langs" :key="j" class="col-6 q-pa-md">
                      <div class="q-pa-sm text-subtitle2" :dir="l.dir">{{ l.full_name }}</div>
                      <div>
                        <q-chip
                          v-for="(a, i) in oldAttributeValues.filter(el => el.lang_id === l.id)"
                          :key="i"
                          :label="attributeType === 'Texte' && valueToUpdate !== a ? a.name : ''"
                        >
                          <q-avatar
                            v-if="attributeType === 'Couleurs'"
                            v-bind:style="{'background': a.name}"
                            text-color="white"
                          ></q-avatar>
                          <q-input
                            filled
                            dense
                            v-if="valueToUpdate && valueToUpdate.id === a.id && valueToUpdate.lang_id === a.lang_id"
                            v-model="valueToUpdate.name"
                            type="text"
                            :readonly="!(attributeType === 'Texte')"
                          >
                            <template v-slot:append>
                              <q-icon
                                name="colorize"
                                v-if="attributeType === 'Couleurs'"
                                class="cursor-pointer"
                              >
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                  <q-color v-model="valueToUpdate.name"/>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                          <q-btn
                            v-if="valueToUpdate === a"
                            flat
                            round
                            class="q-ml-sm"
                            color="grey-8"
                            size="sm"
                            icon="fas fa-check-circle"
                            @click="updateValue()"
                          />
                          <q-btn
                            v-if="valueToUpdate === a"
                            flat
                            round
                            class="q-ml-sm"
                            color="grey-8"
                            size="sm"
                            icon="fas fa-times-circle"
                            @click="valueToUpdate = null"
                          />

                          <q-btn
                            v-if="valueToUpdate !== a"
                            flat
                            round
                            class="q-ml-sm"
                            color="grey-8"
                            size="xs"
                            icon="fas fa-pen"
                            @click="setAttributeValue(a)"
                          />
                          <q-btn
                            v-if="valueToUpdate !== a"
                            flat
                            round
                            class="q-ml-sm"
                            color="grey-8"
                            size="xs"
                            icon="fas fa-times"
                            @click="deleteAttributeValue(a)"
                          />
                        </q-chip>

                        <q-chip
                          v-for="( a, i) in attributeValues"
                          :key="i"
                          :label="attributeType === 'Texte' ? a[l.id] : ''"
                        >
                          <q-avatar
                            v-if="attributeType === 'Couleurs'"
                            v-bind:style="{'background': a[l.id]}"
                            text-color="white"
                          ></q-avatar>
                          <q-btn
                            flat
                            round
                            class="q-ml-sm"
                            color="grey-8"
                            size="xs"
                            icon="fas fa-times"
                            @click="attributeValues.splice(i,1)"
                          />
                        </q-chip>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 q-pa-md">
                    <q-toggle
                      size="sm"
                      v-model="isActif"
                      color="blue-10"
                      label="Afficher sur le site ?"
                    />
                  </div>
                </div>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
        <div class="row">
          <div class="col-12 text-right q-gutter-sm q-pt-md q-pb-sm">
            <!-- <q-btn
              label="Annuler"
              type="button"
              color="grey-10"
              size="sm"
              class="q-pa-xs"
              @click="$emit('closeDialog')"
            />-->
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
  name: 'CreateAttributeComponent',
  props: ['recordToEdit', 'dialog'],
  data () {
    return {
      loading: false,
      image: null,
      isActif: true,
      attributeType: 'Texte',
      valueToUpdate: {},
      fields: {},
      langs: [],
      options: ['Texte', 'Couleurs'],
      attributeValue: {},
      attributeValues: [],
      deletedAttributeValues: [],
      oldAttributeValues: [],
      attributeValueHint: ''
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
    valueToUpdateIndex (a) {
      return this.oldAttributeValues.findIndex(
        el => el.id === a.id && a.lang_id === el.lang_id
      )
    },
    setAttributeValue (a) {
      const i = this.valueToUpdateIndex(a)
      this.valueToUpdate = this.oldAttributeValues[i]
    },
    updateValue () {
      const i = this.valueToUpdateIndex(this.valueToUpdate)
      this.oldAttributeValues[i] = this.valueToUpdate
      this.oldAttributeValues[i].updated = true
      this.valueToUpdate = null
    },
    deleteAttributeValue (a) {
      this.deletedAttributeValues.push(a.id)
      this.oldAttributeValues = this.oldAttributeValues.filter(
        el => el.id !== a.id
      )
    },
    addAttributeValue () {
      let empty = false
      this.langs.forEach(l => {
        if (
          this.attributeValue[l.id] === '' ||
          this.attributeValue[l.id] === undefined
        ) {
          empty = true
        }
      })
      if (!empty) {
        this.attributeValues.push(this.attributeValue)
        this.attributeValue = {}
        this.attributeValueHint = ''
      } else {
        this.attributeValueHint = 'empty'
      }
    },
    initFields () {
      const fields = {}
      this.loading = false
      this.attributeValues = []
      this.deletedAttributeValues = []
      this.oldAttributeValues = []
      if (this.recordToEdit === null) {
        this.isActif = true

        this.attributeType = 'Texte'
        this.langs.forEach(element => {
          fields[element.id] = {
            lang_id: element.id,
            name: '',
            description: ''
          }
        })
      } else {
        this.isActif = this.recordToEdit.is_activated === 1
        this.attributeType =
          this.recordToEdit.type === 'TEXT' ? 'Texte' : 'Couleurs'
        this.oldAttributeValues = this.recordToEdit.attributeValues
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
            data.append(
              'deleted_attribute_values',
              JSON.stringify(this.deletedAttributeValues)
            )
            data.append(
              'updated_attribute_values',
              JSON.stringify(
                this.oldAttributeValues.filter(obj => obj.updated !== undefined)
              )
            )
          }

          data.append('rows', JSON.stringify(this.fields))
          data.append('is_activated', this.isActif ? 1 : 0)
          data.append(
            'attribute_type',
            this.attributeType === 'Texte' ? 'TEXT' : 'COLOR'
          )
          data.append('attribute_values', JSON.stringify(this.attributeValues))

          this.$axios
            .post(
              'attribute' +
                (method === 'put' ? '/' + this.recordToEdit.id : ''),
              data,
              config
            )
            .then(res => {
              this.$q.notify({
                color: 'blue-10',
                message:
                  "L'attribut a été " +
                  (method === 'put' ? 'modifié' : 'créé') +
                  ' avec succés !'
              })
              const obj = {
                lang_id: 1,
                name: this.fields[1].name,
                label: this.fields[1].name,
                description: this.fields[1].description,
                ...res.data.attribute,
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
