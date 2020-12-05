<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div
              class="text-subtitle1 text-grey-10 text-weight-bold"
            >{{ getType === 'subCategory' ? 'Sous catégories ' : 'Catégories' }}</div>
          </q-toolbar-title>

          <div v-if="recordToEdit">
            <q-btn flat class="bg-red-1 q-ml-sm q-pa-xs" color="red-8" size="sm" label="supprimer"/>
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
            v-if="hasRole('POST_PRODUCT_CATEGORY')"
            :label="'Nouveau'"
            color="blue-10"
            class="q-ml-sm bg-blue-2 q-pa-xs"
            @click="recordToEdit=null; dialog = true"
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
        <productCategoryCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          :parentName="parentName(recordToEdit.product_category_id)"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:deleteImage="deleteImage(recordToEdit.id)"
        ></productCategoryCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page>
          <q-table
            v-if="hasRole('GET_PRODUCT_CATEGORY')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="getCategoriesByType"
            :filter="filter"
            :columns="getColumns"
            :loading="!fetched"
            row-key="row_key"
            :selected-rows-label="getSelectedString"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-avatar="props">
              <q-td v-bind:class="getTdStyle(props.row)" auto-width>
                <q-avatar rounded size="lg" color="blue-10">
                  <img
                    v-if="props.row.image"
                    :src="$axios.defaults.baseURL.replace('api', 'images') + props.row.image"
                  >
                  <div v-else class="text-subtitle2 text-white">{{ props.row.name[0] }}</div>
                </q-avatar>
              </q-td>
            </template>
            <template  v-slot:body-cell-name="props">
              <q-td v-bind:class="getTdStyle(props.row)" @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.name }}</div>
                <div class="text-caption text-grey-5">{{ props.row.description }}</div>
              </q-td>
            </template>
            <template  v-slot:body-cell-parent="props">
              <q-td
              v-bind:class="getTdStyle(props.row)"
                @click="setRecordToEdit(props.row.id);"
              >{{ parentName(props.row.product_category_id) }}</q-td>
            </template>
          </q-table>

          <ProductCategoryComponent
            v-if="hasRole('POST_PRODUCT_CATEGORY') || hasRole('PUT_PRODUCT_CATEGORY')"
            :categories="categoriesOptions"
            :dialog="dialog"
            :type="getType"
            :selectedProductCategory="null"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></ProductCategoryComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import ProductCategoryComponent from 'components/ProductCategoryComponent'
import productCategoryCard from 'components/productCategoryCard'
import EmptyCard from 'components/EmptyCard'
export default {
  name: 'ProductCategoryPage',
  props: ['type'],
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      fetched: false,
      selected: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 20
      },
      filter: '',
      columns: [
        {
          name: 'avatar',
          label: ' ',
          required: true
        },
        {
          name: 'name',
          required: true,
          label: 'Catégorie',
          align: 'left',
          sortable: true
        },
        {
          name: 'parent',
          required: true,
          label: 'Catégorie',
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  computed: {
    getType () {
      return this.$route.params.type
    },
    getColumns () {
      const columns = this.columns
      if (this.getType === 'category') {
        columns[1].label = 'Catégorie'
        return columns.filter(el => el.name !== 'parent')
      }
      columns[1].label = 'Sous catégorie'
      return columns
    },
    categoriesOptions () {
      const data = this.data.filter(el => el.product_category_id === null)
      data.forEach(function (el, i) {
        el.row_key = i
      })
      return data
    },
    getCategoriesByType () {
      if (this.getType) {
        const type = this.getType
        if (type === 'category') {
          return this.data.filter(el => el.product_category_id === null)
        } else {
          return this.data.filter(el => el.product_category_id !== null)
        }
      }
      return []
    }
  },
  components: {
    ProductCategoryComponent,
    productCategoryCard,
    EmptyCard
  },
  mounted () {
    this.getCategories()
  },
  methods: {
    getCategories () {
      this.$axios.get('/productCategory').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },
    parentName (parentId) {
      const name = this.data.find(e => e.id === parseInt(parentId))
      return name ? name.name : '/'
    },
    updateTableRows (data) {
      const index = this.data.findIndex(e => e.id === data.id)
      if (index !== -1) {
        this.data.splice(index, 1, data)
      } else {
        this.data.push(data)
      }
      this.setRecordToEdit(data.id)
      this.dialog = false
    },
    setRecordToEdit (id) {
      if (
        this.recordToEdit === null ||
        this.dialog === true ||
        parseInt(this.recordToEdit.id) !== parseInt(id)
      ) {
        this.$axios.get('productCategory/' + id).then(res => {
          this.recordToEdit = res.data
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
    deleteImage (id) {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      const data = new FormData()

      data.append('_method', 'PUT')
      data.append('delete_image', true)

      this.$axios.post('productCategory/' + id, data, config).then(res => {
        this.data.forEach((el, i) => {
          if (el.id === id) {
            const row = el
            row.image = null
            this.data.splice(i, 1, row)
          }
        })
      })
    },
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
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
