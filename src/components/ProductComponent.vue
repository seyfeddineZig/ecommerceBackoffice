<template>
  <q-dialog persistent v-model="dialog">
    <q-card class="q-pa-xs" style="width: 90vw; max-width: 90vw;">
      <q-form ref="form" @submit="onSubmit">
        <q-card-section class="bg-grey-1 no-padding">
          <div class="row q-pa-sm">
            <div class="col-6">
              <div
                class="text-subtitle1 q-pl-sm"
              >{{ recordToEdit === null ? 'Nouveau ' : 'Modifier ' }} {{ productType === 'PRODUCT' ? 'Produit' : 'Kit' }}</div>
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
        <q-card-section horizontal style="max-height: 73vh" class="scroll q-pa-sm q-mb-md">
          <q-card-section class="col-md-9 col-12 no-padding">
            <q-list bordered class="no-margin">
              <MultilangContent :fields="fields" :langs="langs"></MultilangContent>
              <q-expansion-item
                header-class="bg-grey-1"
                expand-separator
                label="Tarification"
                default-opened
              >
                <PricingComponent v-if="pricing !== undefined" :pricing="pricing"></PricingComponent>
              </q-expansion-item>
              <q-expansion-item
                v-if="productType === 'KIT'"
                expand-separator
                header-class="bg-grey-1"
                label="Contenu"
                default-opened
              >
                <KitContentComponent
                  :products="products.filter(el => el.type === 'PRODUCT')"
                  :action="action"
                  :kitContent="kitContent"
                  v-on:addKitContent="addKitContent"
                  v-on:deleteKitContent="deleteKitContent"
                ></KitContentComponent>
              </q-expansion-item>
              <q-expansion-item
                v-if="productType === 'PRODUCT'"
                expand-separator
                header-class="bg-grey-1"
                label="Colisage"
              >
                <div class="q-pa-sm">
                  <q-btn
                    flat
                    round
                    size="md"
                    color="grey-10"
                    class="bg-grey-2"
                    icon="add"
                    @click="packageToEdit=null, packageDialog=true"
                  />
                </div>
                <div class="row">
                  <div class="col-12 q-pa-sm">
                    <PackageTable
                      :actions="true"
                      :productPackages="productPackages"
                      :pricing="pricing"
                      v-on:editPackage="editPackage"
                    ></PackageTable>
                  </div>
                </div>
              </q-expansion-item>
              <q-expansion-item header-class="bg-grey-1" expand-separator label="Note">
                <div class="q-pa-sm">
                  <q-input dense filled v-model="note" type="text" label="Note" autogrow/>
                </div>
              </q-expansion-item>
              <SEO :fields="fields" :langs="langs"></SEO>
            </q-list>
          </q-card-section>
          <q-card-section class="col-md-3 col-12 no-padding">
            <q-list bordered>
              <q-expansion-item
                v-if="productType === 'PRODUCT'"
                header-class="bg-grey-1"
                expand-separator
                label="informations générales"
                default-opened
              >
                <div class="row q-pa-sm">
                  <div class="col-12 q-pa-sm">
                    <q-select
                      style="width: 100%;"
                      filled
                      dense
                      v-model="productCategory"
                      use-input
                      hide-selected
                      fill-input
                      label="Catégorie"
                      input-debounce="0"
                      :options="categoryOptions"
                      @input="$emit('selectedProductCategory', productCategory); setSubCategories()"
                      @filter="filterCategorySelect"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">Aucun résultat</q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:append>
                        <q-btn
                          round
                          dense
                          flat
                          icon="add"
                          @click="$emit('openCategoryDialog', 'category')"
                        />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-select
                      style="width: 100%;"
                      filled
                      dense
                      v-model="productSubCategory"
                      use-input
                      hide-selected
                      fill-input
                      label="Sous catégorie"
                      input-debounce="0"
                      :options="subCategoryOptions"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">Aucun résultat</q-item-section>
                        </q-item>
                      </template>
                      <template v-if="productCategory !== null" v-slot:append>
                        <q-btn
                          round
                          dense
                          flat
                          icon="add"
                          @click="$emit('openCategoryDialog', 'subCategory')"
                        />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-select
                      style="width: 100%;"
                      filled
                      dense
                      v-model="brand"
                      use-input
                      hide-selected
                      fill-input
                      label="Marques"
                      input-debounce="0"
                      :options="brandOptions"
                      @filter="filterBrandSelect"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">Aucun résultat</q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:append>
                        <q-btn round dense flat icon="add" @click="$emit('openBrandDialog')"/>
                      </template>
                    </q-select>
                  </div>
                  <div class="col-6 q-pa-sm">
                    <q-input
                      dense
                      filled
                      v-model="code"
                      type="text"
                      label="Code *"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    />
                  </div>
                  <div class="col-6 q-pa-sm">
                    <q-input
                      dense
                      filled
                      v-model="reference"
                      type="text"
                      label="Réference *"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    />
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-input
                      dense
                      filled
                      v-model="barCode"
                      type="text"
                      label="Code barre"
                      :rules="[val => !!val || 'Ce champ est obligatoire']"
                    >
                      <template v-slot:prepend>
                        <q-icon size="15px" name="fas fa-barcode"/>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-input dense filled v-model="alertQty" type="number" label="Qté d'alerte">
                      <template v-slot:prepend>
                        <q-icon size="15px" name="fas fa-exclamation-triangle"/>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-toggle
                      size="sm"
                      v-model="isActif"
                      color="blue-10"
                      label="Afficher sur le site ?"
                    />
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-toggle
                      size="sm"
                      v-model="isGuarantee"
                      color="blue-10"
                      label="Avec garantie ?"
                    />
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-toggle
                      size="sm"
                      v-model="sellByUnit"
                      color="blue-10"
                      label="Vente par unité ?"
                    />
                  </div>
                </div>
              </q-expansion-item>
              <q-expansion-item
                header-class="bg-grey-1"
                expand-separator
                label="Attachement"
                default-opened
              >
                <div class="row q-pa-sm">
                  <div class="col-12 q-pa-sm">
                    <q-file
                      v-model="image"
                      filled
                      dense
                      label="Image principale"
                      :filter="checkFileType"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="far fa-image"/>
                      </template>
                    </q-file>
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-file
                      v-model="images"
                      filled
                      dense
                      use-chips
                      multiple
                      label="Autres images"
                      :filter="checkFileType"
                      @rejected="onRejected"
                    >
                      <template v-slot:prepend>
                        <q-icon name="far fa-images"/>
                      </template>
                    </q-file>
                  </div>
                  <div class="col-12 q-pa-sm">
                    <q-input dense filled v-model="videoURL" type="text" label="URL du video">
                      <template v-slot:prepend>
                        <q-icon name="fab fa-youtube" size="15px"/>
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-expansion-item>
              <q-expansion-item
                v-if="productType==='PRODUCT'"
                header-class="bg-grey-2"
                expand-separator
                label="Caracteristiques"
              >
                <div class="row">
                  <ProductAttributes :attributes="attributes" :selectedValues="selectedValues"></ProductAttributes>

                  <div class="q-pa-sm items-right">
                    <q-btn
                      flat
                      round
                      size="xs"
                      class="q-pa-xs bg-grey-3 text-grey-10"
                      icon="add"
                      @click="dialogNewAttribute = true"
                    />
                  </div>
                </div>

                <ProductAddAttribute
                  :dialog="dialogNewAttribute"
                  :attributes="attributes"
                  :attributeValues="attributeValues"
                  :selectedValues="selectedValues"
                  v-on:closeDialog="dialogNewAttribute=false"
                  v-on:openAttributeDialog="attributeDialog = true"
                  v-on:updateAttributeSelectOptions="updateAttributeSelectOptions"
                ></ProductAddAttribute>
                <PackageComponent
                  v-on:closeDialog="closePackageDialog"
                  :pricing="pricing"
                  :packageDialog="packageDialog"
                  :recordToEdit="packageToEdit"
                  v-on:updatePackage="updateProductPackages"
                ></PackageComponent>
              </q-expansion-item>
            </q-list>
          </q-card-section>
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
import SEO from './SEO'
import PricingComponent from './Pricing'
import MultilangContent from './MultilangContent'
import ProductAttributes from './ProductAttributes'
import ProductAddAttribute from './ProductAddAttribute'
import PackageComponent from './PackageComponent'
import PackageTable from './PackageTable'
import KitContentComponent from './KitContent'

export default {
  name: 'CreateProductComponent',
  props: [
    'recordToEdit',
    'dialog',
    'categories',
    'brands',
    'products',
    'pricing',
    'packagePricing',
    'attributes',
    'attributeValues',
    'productType'
  ],
  data () {
    return {
      loading: false,
      packageDialog: false,
      action: '',
      image: null,
      images: null,
      isActif: true,
      alertQty: null,
      isGuarantee: true,
      sellByUnit: true,
      fields: {},
      langs: [],
      code: '',
      barCode: '',
      reference: '',
      videoURL: '',
      note: '',
      kitContent: [],
      productCategory: null,
      productSubCategory: null,
      brand: null,
      categoryOptions: [],
      subCategoryOptions: [],
      brandOptions: [],
      selectedValues: [],
      dialogNewAttribute: false,
      productPackages: [],
      newPackages: [],
      packageToEdit: null,
      initialPackagePagination: {
        page: 1,
        rowsPerPage: 1000
      }
    }
  },
  components: {
    SEO,
    MultilangContent,
    PricingComponent,
    ProductAttributes,
    ProductAddAttribute,
    PackageComponent,
    PackageTable,
    KitContentComponent
  },
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
    setSubCategories () {
      this.subCategoryOptions = this.categories.filter(el => parseInt(el.product_category_id) === parseInt(this.productCategory.id))
      if (this.subCategoryOptions.length > 0) {
        if (this.recordToEdit !== null) {
          const id = parseInt(this.recordToEdit.product_category_id)
          this.productSubCategory = this.subCategoryOptions.find(el => el.id === id)
        } else {
          this.productSubCategory = null
        }
      } else {
        this.productSubCategory = null
      }
    },
    updateAttributeSelectOptions ({ data, attributeValues, deletedValues }) {
      this.$emit('updateAttributeSelectOptions', {
        data: data,
        attributeValues: attributeValues,
        deletedValues: deletedValues
      })
    },
    initFields () {
      const fields = {}
      this.loading = false
      this.image = null
      this.images = null

      if (this.recordToEdit === null) {
        this.productCategory = null
        this.productSubCategory = null
        this.isActif = true
        this.alertQty = null
        this.isGuarantee = true
        this.sellByUnit = true
        this.code = ''
        this.barCode = ''
        this.reference = ''
        this.videoURL = ''
        this.note = ''
        this.productCategory = null
        this.brand = null
        this.selectedValues = []
        this.productPackages = []
        this.newPackages = []
        this.kitContent = []
        this.action = 'ADD'
        this.langs.forEach(element => {
          fields[element.id] = {
            lang_id: element.id,
            name: '',
            description: '',
            detailed_description: '',
            page_title: '',
            meta_description: '',
            meta_keywords: ''
          }
        })
      } else {
        this.isActif = parseInt(this.recordToEdit.is_activated) === 1
        this.productCategory = this.categories.find(
          el => parseInt(el.id) === parseInt(this.recordToEdit.category_id)
        )
        this.setSubCategories()
        this.brand = this.brands.find(
          el => parseInt(el.id) === parseInt(this.recordToEdit.brand_id)
        )
        this.selectedValues = this.recordToEdit.productValues
        this.alertQty = this.recordToEdit.alert_qty
        this.isGuarantee = parseInt(this.recordToEdit.guarantee) === 1
        this.code = this.recordToEdit.code
        this.barCode = this.recordToEdit.bar_code
        this.reference = this.recordToEdit.reference
        this.videoURL = this.recordToEdit.video_url
        this.note = this.recordToEdit.note
        this.recordToEdit.fields.forEach(element => {
          fields[element.lang_id] = {
            lang_id: element.lang_id,
            name: element.name,
            description: element.description,
            detailed_description: element.detailed_description,
            page_title: element.page_title,
            meta_description: element.meta_description,
            meta_keywords: element.meta_keywords
          }
        })
        this.productPackages = this.recordToEdit.productPackages
        this.kitContent = this.recordToEdit.kitContent
        this.newPackages = []
        this.action = 'EDIT'
      }

      this.fields = fields
    },
    onSubmit () {
      this.loading = true
      this.$refs.form.validate().then(success => {
        if (success) {
          if (this.productType === 'KIT' && this.kitContent.length === 0) {
            this.$q.notify({
              type: 'negative',
              message: 'Veuillez saisir le contenu du kit'
            })
            this.loading = false
          } else {
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
            if (this.images) {
              this.images.forEach((el, i) => {
                data.append('extra_image_' + i, el)
              })
              data.append('extra_images_count', this.images.length)
            }

            data.append('is_activated', this.isActif ? 1 : 0)
            data.append('type', this.productType)

            if (this.productType === 'PRODUCT') {
              data.append('reference', this.reference)
              data.append('bar_code', this.barCode)
              data.append('code', this.code)
              data.append('video_url', this.videoURL)
              if (this.alertQty) {
                data.append('alert_qty', this.alertQty)
              }
              data.append('product_category_id', this.productSubCategory.id)
              data.append('brand_id', this.brand.id)
              data.append('is_guarantee', this.isGuarantee ? 1 : 0)
              data.append('sell_by_unit', this.sellByUnit ? 1 : 0)
              data.append(
                'selected_values',
                JSON.stringify(this.selectedValues.map(obj => obj.id))
              )
              data.append('packages', JSON.stringify(this.newPackages))
            } else {
              data.append('kit_content', JSON.stringify(this.kitContent))
            }

            data.append('note', this.note)

            data.append(
              'pricing',
              JSON.stringify(
                this.pricing.map(obj => ({ id: obj.id, price: obj.price }))
              )
            )

            this.$axios
              .post(
                'product' + (method === 'put' ? '/' + this.recordToEdit.id : ''),
                data,
                config
              )
              .then(res => {
                this.$q.notify({
                  color: 'blue-10',
                  message:
                  'Le produit a été ' +
                  (method === 'post' ? 'créé' : 'modifié') +
                  ' avec succés !'
                })

                const obj = {
                  lang_id: 1,
                  name: this.fields[1].name,
                  label: this.fields[1].name,
                  description: this.fields[1].description,
                  ...res.data,
                  is_activated: this.isActif ? 1 : 0
                }
                if (this.productType === 'PRODUCT') {
                  obj.category_name = this.productCategory.name
                  obj.sub_category_name = this.productSubCategory.name
                }
                if (method === 'put') {
                  obj.created_by = this.recordToEdit.created_by
                }

                this.$emit('updateTableRows', obj)
              })
              .catch(err => {
                this.loading = false
                let message = ''
                if (err.response && err.response.status === 401) {
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
        }
      })
    },
    updateProductPackages (data) {
      if (data.id === undefined) {
        this.newPackages.push(data)
        const el = data.find(el => parseInt(el.lang_id) === 1)
        this.productPackages.push(el)
      } else {
        this.productPackages = this.productPackages
          .filter(el => parseInt(el.id) !== parseInt(data.id))
        this.productPackages.push(
          data
        )
      }
      this.packageDialog = false
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

    filterCategorySelect (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.categoryOptions = this.categories.filter(
          v =>
            v.label.toLowerCase().indexOf(needle) > -1 &&
            v.product_category_id === null
        )
      })
    },

    filterSubCategorySelect (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        if (this.productCategory) {
          this.subCategoryOptions = this.categories.filter(
            v =>
              v.label.toLowerCase().indexOf(needle) > -1 &&
              parseInt(v.product_category_id) ===
                parseInt(this.productCategory.id)
          )
          if (this.recordToEdit !== null) {
            this.productSubCategory = this.subCategoryOptions.find(
              el =>
                parseInt(el.id) ===
                parseInt(this.recordToEdit.product_category_id)
            )
          }
        } else {
          this.subCategoryOptions = []
        }
      })
    },

    filterBrandSelect (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.brandOptions = this.brands.filter(
          v =>
            v.label.toLowerCase().indexOf(needle) > -1 &&
            (this.recordToEdit === null || parseInt(v.id) !== parseInt(this.recordToEdit.id))
        )
      })
    },

    editPackage (packageId) {
      this.$axios
        .get('/productPackage/' + packageId)
        .then(res => {
          this.packageToEdit = res.data
          this.$emit('setPackagePricings', res.data.pricing)
          this.packageDialog = true
        })
    },
    addKitContent (data) {
      this.kitContent.push(data)
    },
    deleteKitContent (productId) {
      const i = this.kitContent.findIndex(
        el => parseInt(el.product_id) === parseInt(productId)
      )
      if (i !== -1) {
        this.kitContent.splice(i, 1)
      }
    },
    closePackageDialog () {
      this.packageDialog = false
    }
  }
}
</script>
