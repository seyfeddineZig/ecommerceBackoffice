<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Marques</div>
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
            v-if="hasRole('POST_BRAND')"
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
        <BrandCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:deleteImage="deleteImage(recordToEdit.id)"
        ></BrandCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page>
          <q-table
            v-if="hasRole('GET_BRAND')"
            class="my-sticky-header-table no-border no-shadow"
            title
            :pagination="initialPagination"
            :data="data"
            :filter="filter"
            :columns="columns"
            row-key="row_key"
            :loading="!fetched"
            :selected-rows-label="getSelectedString"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-avatar="props">
              <q-td
                v-bind:class="getTdStyle(props.row)"
                auto-width
                @click="setRecordToEdit(props.row.id);"
              >
                <q-avatar rounded color="blue-10" size="lg">
                  <img
                    v-if="props.row.image"
                    :src="$axios.defaults.baseURL.replace('api', 'images') + props.row.image"
                  >
                  <div v-else class="text-subtitle1 text-white">{{ props.row.name[0] }}</div>
                </q-avatar>
              </q-td>
            </template>
            <template v-slot:body-cell-name="props">
              <q-td v-bind:class="getTdStyle(props.row)" @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.name }}</div>
                <div class="text-caption text-grey-6">{{ props.row.description }}</div>
              </q-td>
            </template>
          </q-table>
          <BrandComponent
            v-if="hasRole('POST_BRAND') || hasRole('PUT_BRAND')"
            :dialog="dialog"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></BrandComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import BrandComponent from 'components/BrandComponent'
import BrandCard from 'components/BrandCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'BrandPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      selected: [],
      fetched: false,
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
          label: 'Marque',
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  components: {
    BrandComponent,
    BrandCard,
    EmptyCard
  },
  mounted () {
    this.getBrands()
  },
  methods: {
    getBrands () {
      this.$axios.get('/brand').then(res => {
        this.data = res.data
        this.fetched = true
      })
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
        this.$axios.get('brand/' + id).then(res => {
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

      this.$axios.post('brand/' + id, data, config).then(res => {
        this.data.forEach((el, i) => {
          if (el.id === id) {
            const row = el
            row.image = null
            this.data.splice(i, 1, row)
          }
        })
      })
    },
    addRowToSelected (row) {
      const i = this.selected.findIndex(el => el.id === row.id)

      if (i === -1) {
        this.selected.push(row)
      } else {
        this.selected.splice(i, 1)
      }
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
