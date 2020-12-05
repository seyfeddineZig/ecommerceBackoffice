<template>
  <q-dialog v-model="packageDialog" persistent>
    <q-card style="width: 50vw; max-width: 80vw">
      <q-form ref="form" @submit="onSubmit" class="q-gutter-md">
        <q-card-section>
          <div class="row q-pa-sm">
            <div class="col-6">
              <div
                class="text-subtitle1 q-pl-sm"
              >{{ recordToEdit !== null ? 'Modifier ' : 'Nouveau ' }} colis</div>
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

          <q-list bordered>
            <MultilangContent :fields="fields" :langs="langs"></MultilangContent>
            <q-expansion-item
              expand-separator
              default-opened
              label="Informations générales"
              header-class="bg-grey-2"
            >
              <div class="row q-pa-sm">
                <div class="col-6 q-pa-sm">
                  <q-input
                    filled
                    v-model="packageQty"
                    dense
                    type="number"
                    mask="#"
                    :readonly="recordToEdit !== null"
                    label="Quantité"
                    :rules="[val => !!val || 'Ce champ est obligatoire', val => parseFloat(val)>0 || 'La quantité doit ètre supérieur de 0']"
                  />
                </div>
                <div class="col-6 q-pa-sm">
                  <q-select
                    v-model="customerCategoryId"
                    :options="pricing"
                    label="Prix de vente"
                    filled
                    dense
                  >
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                        <q-item-section>
                          <q-item-label v-html="scope.opt.label"/>
                          <q-item-label caption class="text-blue-10 text-weight-bold">{{ scope.opt.price }} DZD</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div class="col-6 q-pa-sm">
                  <q-toggle
                    size="sm"
                    v-model="isActif"
                    color="blue-10"
                    label="Afficher sur le site ?"
                  />
                </div>
                <div class="col-6 q-pa-sm">
                  <q-toggle
                    size="sm"
                    v-model="isDefault"
                    color="blue-10"
                    label="Definir comme colis par defaut ?"
                  />
                </div>
              </div>
            </q-expansion-item>
          </q-list>
        </q-card-section>
        <q-card-actions class="bg-grey-2" align="right">
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
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script>
import MultilangContent from './MultilangContent'
// import Pricing from './Pricing'
export default {
  props: ['packageDialog', 'pricing', 'recordToEdit'],
  data () {
    return {
      fields: {},
      loading: false,
      isActif: true,
      isDefault: false,
      customerCategoryId: null,
      langs: [],
      packageQty: 0
    }
  },
  components: {
    MultilangContent
    // Pricing
  },
  watch: {
    packageDialog: function (val) {
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
        this.isDefault = false
        this.packageQty = 0

        this.langs.forEach(element => {
          fields[element.id] = {
            lang_id: element.id,
            name: ''
          }
        })
      } else {
        this.isActif = this.recordToEdit.is_activated === 1
        this.isDefault = this.recordToEdit.is_default_package === 1
        this.customerCategoryId = this.pricing.find(el => el.id === this.recordToEdit.customer_category_id)
        this.packageQty = this.recordToEdit.qty
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
          if (this.recordToEdit === null) {
            const data = []
            this.langs.forEach(el => {
              data.push({
                is_activated: this.isActif,
                is_default: this.isDefault,
                name: this.fields[el.id].name,
                qty: this.packageQty,
                customer_category_id: this.customerCategoryId.id,
                lang_id: el.id
              })
            })
            this.$emit('updatePackage', data)
          } else {
            const data = {
              _method: 'PUT',
              is_activated: this.isActif,
              rows: this.fields,
              customer_category_id: this.customerCategoryId.id,
              is_default: this.isDefault
            }
            this.$axios
              .post('productPackage/' + this.recordToEdit.id, data)
              .then(res => {
                this.$emit('updatePackage', {
                  id: this.recordToEdit.id,
                  is_activated: this.isActif,
                  name: this.fields[1].name,
                  qty: this.packageQty,
                  customer_category_id: this.customerCategoryId.id,
                  is_default: this.isDefault
                })
              })
          }
        }
      })
      this.loading = false
    }
  }
}
</script>
