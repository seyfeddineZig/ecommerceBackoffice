<template>
  <q-page>
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Produits</div>
          </q-toolbar-title>
          <div v-if="recordToEdit">
            <q-btn
              v-if="recordToEdit.type === 'PRODUCT'"
              flat
              class="q-ml-xs bg-blue-1 q-pa-xs"
              color="blue-14"
              size="sm"
              label="duppliquer"
              @click="duplicateProduct(recordToEdit.id)"
              name="far fa-clone"
            />

            <q-btn
              flat
              class="bg-red-1 q-ml-sm q-pa-xs"
              color="red-8"
              size="sm"
              label="supprimer"
            />
            <q-btn
              flat
              class="q-ml-sm bg-grey-3 q-pa-xs"
              color="grey-8"
              size="sm"
              label="modifier"
              @click="setRecordToEdit(recordToEdit.id); dialog= true"
            />
          </div>
          <q-btn
            flat
            v-if="hasRole('POST_PRODUCT')"
            label="Importer un fichier Excel"
            color="grey-1"
            class="q-ml-sm bg-grey-10 q-pa-xs "
            size="sm"
            @click="importXlsDialog = true"
          />
          <q-btn
            flat
            v-if="hasRole('POST_PRODUCT')"
            label="Nouveau produit"
            class="q-ml-sm bg-blue-2 q-pa-xs "
            color="blue-10"
            @click="recordToEdit=null; initPrices(); productType = 'PRODUCT'; dialog = true"
            size="sm"
          />
          <q-btn
            flat
            v-if="hasRole('POST_KIT')"
            label="Nouveau Kit"
            class="q-ml-sm bg-blue-2 q-pa-xs "
            color="blue-10"
            @click="recordToEdit=null; initPrices(); productType = 'KIT'; dialog = true"
            size="sm"
          />
        </q-toolbar>
      </q-header>

      <q-drawer
        side="right"
        v-model="drawerRight"
        bordered
        :width="500"
        :breakpoint="500"
        content-class="bg-grey-1"
      >
        <ProductCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          :pricing="pricing"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:deleteImage="deleteImage"
        ></ProductCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page>
          <q-table
            v-if="hasRole('GET_PRODUCT')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="data"
            :filter="filter"
            :columns="columns"
            :loading="!fetched"
            row-key="row_key"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-avatar="props">
              <q-td v-bind:class="getTdStyle(props.row)" auto-width>
                <q-avatar rounded size="xl" color="blue-10">
                  <img
                    v-if="props.row.default_image"
                    :src="$axios.defaults.baseURL.replace('api', 'images') + props.row.default_image"
                  >
                  <div v-else class="text-subtitle2 text-white">{{ props.row.name[0] }}</div>
                </q-avatar>
              </q-td>
            </template>
            <template v-slot:body-cell-name="props">
              <q-td v-bind:class="getTdStyle(props.row)" @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold text-overflow">
                  {{ props.row.name }}
                  <q-tooltip>{{ props.row.name }}</q-tooltip>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-ref="props">
              <q-td
                v-bind:class="getTdStyle(props.row)"
                @click="setRecordToEdit(props.row.id);"
              >{{ props.row.reference}}</q-td>
            </template>
            <template v-slot:body-cell-code="props">
              <q-td
                v-bind:class="getTdStyle(props.row)"
                @click="setRecordToEdit(props.row.id);"
              >{{ props.row.code}}</q-td>
            </template>
          </q-table>
          <ProductComponent
            v-if="hasRole('POST_PRODUCT') || hasRole('PUT_PRODUCT')"
            :dialog="dialog"
            :products="data"
            :categories="categories"
            :subCategories="categories"
            :brands="brands"
            :attributes="attributes"
            :attributeValues="attributeValues"
            :pricing="pricing"
            :packagePricing="packagePricing"
            :recordToEdit="recordToEdit"
            :productType="productType"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            v-on:openPackageDialog="packageDialog = true"
            v-on:openCategoryDialog="openCategoryDialog"
            v-on:openBrandDialog="brandDialog = true"
            v-on:selectedProductCategory="setSelectedProductCategory"
            v-on:updateAttributeSelectOptions="updateAttributeSelectOptions"
            v-on:setPackagePricings="setPackagePricings"
          ></ProductComponent>
          <ImportProductXls
            v-if=" fetched && (hasRole('POST_PRODUCT') || hasRole('PUT_PRODUCT'))"
            :attributes="attributes"
            :dialog="importXlsDialog"
            :pricing="pricing"
            :langs="langs"
            :xlsFiles="xlsFiles"
            v-on:closeDialog="importXlsDialog=false"
            v-on:reloadProducts="loadData"
          ></ImportProductXls>
          <ProductCategoryComponent
            v-if="hasRole('POST_PRODUCT_CATEGORY')"
            :categories="categories"
            :dialog="categoryDialog"
            :type="categoryType"
            v-on:closeDialog="categoryDialog=false"
            :recordToEdit="null"
            :selectedProductCategory="selectedProductCategory"
            v-on:updateTableRows="updateCategorySelectOptions"
          ></ProductCategoryComponent>
          <BrandComponent
            v-if="hasRole('POST_BRAND')"
            :dialog="brandDialog"
            v-on:closeDialog="brandDialog=false"
            v-on:updateTableRows="updateBrandSelectOptions"
            :recordToEdit="null"
          ></BrandComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import ProductComponent from 'components/ProductComponent'
import ProductCategoryComponent from 'components/ProductCategoryComponent'
import ProductCard from 'components/ProductCard'
import EmptyCard from 'components/EmptyCard'
import ImportProductXls from 'components/ImportProductXls'
import BrandComponent from 'components/BrandComponent'

export default {
  name: 'ProductPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      categoryDialog: false,
      kitDialog: false,
      brandDialog: false,
      productType: 'PRODUCT',
      categoryType: 'category',
      selectedProductCategory: null,
      importXlsDialog: false,
      recordToEdit: null,
      data: [],
      kits: [],
      categories: [],
      brands: [],
      attributes: [],
      attributeValues: [],
      productValues: [],
      fetched: false,
      selected: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 20
      },
      filter: '',
      productPricing: [],
      columns: [
        {
          name: 'avatar',
          label: ' ',
          required: true
        },
        {
          name: 'name',
          required: true,
          label: 'Produit',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: 'ref',
          required: true,
          label: 'Réference',
          align: 'left',
          field: row => row.reference,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: 'code',
          required: true,
          label: 'Code',
          align: 'left',
          sortable: true
        }
      ],
      pricing: [],
      packagePricing: [],
      langs: [],
      productsPackages: [],
      xlsFiles: []
    }
  },
  components: {
    ProductComponent,
    EmptyCard,
    ImportProductXls,
    ProductCard,
    ProductCategoryComponent,
    BrandComponent
  },
  mounted () {
    this.langs = this.$store.getters['config/getLangs']
    this.xlsFiles = this.langs.map(obj => ({
      ...obj,
      file: null
    }))
    this.loadData()
  },
  methods: {
    setSelectedProductCategory (val) {
      this.selectedProductCategory = val
    },
    openCategoryDialog (type) {
      this.categoryType = type
      this.categoryDialog = true
    },

    getProducts () {
      this.$axios.get('/product').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },
    getProductsPackages () {
      this.$axios.get('/productPackage').then(res => {
        this.productsPackages = res.data
      })
    },
    getCategories () {
      this.$axios.get('/productCategory').then(res => {
        this.categories = res.data
      })
    },
    getBrands () {
      this.$axios.get('/brand').then(res => {
        this.brands = res.data
      })
    },
    getCustomerCategories () {
      this.$axios.get('/customerCategory').then(res => {
        const pricing = res.data.map(obj => ({
          ...obj,
          label: obj.name,
          price: 0
        }))
        // this.packagePricing = pricing
        this.pricing = pricing
      })
    },
    getAttributes () {
      this.$axios.get('/attribute').then(res => {
        this.attributes = res.data.attributes
        this.attributeValues = res.data.attribute_values
      })
    },

    updateTableRows (data) {
      const index = this.data.findIndex(e => e.id === data.id)
      if (index !== -1) {
        this.data.splice(index, 1, data)
      } else {
        this.data.unshift(data)
      }
      this.setRecordToEdit(data.id)
      this.dialog = false
    },
    updateCategorySelectOptions (data) {
      this.categories = this.categories.concat(data)
      this.categoryDialog = false
    },
    updateBrandSelectOptions (data) {
      this.brands = this.brands.concat(data)
      this.brandDialog = false
    },
    updateAttributeSelectOptions ({ data, attributeValues, deletedValues }) {
      this.attributeValues = this.attributeValues.concat(attributeValues)
      data.forEach(el => {
        this.attributes.push(el)
      })
      this.attributeDialog = false
    },
    setRecordToEdit (id) {
      if (
        this.recordToEdit === null ||
        this.dialog === true ||
        parseInt(this.recordToEdit.id) !== parseInt(id)
      ) {
        this.$axios.get('product/' + id).then(res => {
          this.productType = res.data.type
          this.recordToEdit = res.data
          this.pricing.forEach(el => {
            el.price = res.data.pricing.find(
              e => e.customer_category_id === el.id
            ).price
          })
        })
      }
    },
    getSelectedString () {
      return this.selected.length === 0
        ? ''
        : `${this.selected.length} ligne${
            this.selected.length > 1 ? 's' : ''
          } selectionné${this.selected.length > 1 ? 's' : ''} de ${
            this.data.length
          }`
    },
    deleteImage (img) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      const data = new FormData()
      const id = this.recordToEdit.id
      data.append('_method', 'PUT')
      data.append('delete_image', true)
      if (img) {
        data.append('image_name', img)
      }

      this.$axios.post('product/' + id, data, config).then(res => {
        this.data.forEach((el, i) => {
          if (el.id === id) {
            const row = el
            if (img) {
              row.images = row.images.replace(img, '')
            } else {
              row.default_image = null
            }

            this.data.splice(i, 1, row)
            this.setRecordToEdit(id)
          }
        })
      })
    },
    duplicateProduct (productId) {
      this.$axios
        .post('/duplicateProduct/' + productId)
        .then(res => {
          const duplicated = this.data.find(
            el => parseInt(el.id) === parseInt(productId)
          )
          if (duplicated) {
            const newProduct = res.data
            newProduct.name = duplicated.name
            newProduct.category_name = duplicated.category_name
            newProduct.sub_category_name = duplicated.sub_category_name

            this.data.unshift(newProduct)
            this.setRecordToEdit(newProduct.id)
            // this.dialog = true
          }

          this.$q.notify({
            color: 'blue-10',
            message: 'Le produit a été crée avec succés !'
          })
        })
        .catch(err => {
          let message = ''
          if (err.response.status === 401) {
            message =
              "Accés non autorisé, vous n'avez pas la permission pour effectuer cette operation"
          }
          this.$q.notify({
            type: 'negative',
            message: message
          })
        })
    },
    setPackagePricings (data) {
      this.packagePricing = data
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    },
    initPrices () {
      this.pricing.forEach(el => {
        el.price = 0
      })
    },
    loadData () {
      this.getProducts()
      this.getCategories()
      this.getBrands()
      this.getCustomerCategories()
      this.getAttributes()
      this.getProductsPackages()
    },
    getTdStyle (row) {
      return [
        this.recordToEdit && this.recordToEdit.id === row.id ? 'bg-blue-1' : '',
        ' cursor-pointer'
      ]
    }
  }
}
</script>
