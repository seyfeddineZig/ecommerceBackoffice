<template>
  <q-page v-if="langData">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Catégories des clients</div>
          </q-toolbar-title>
          <q-btn
            v-if="hasRole('POST_CUSTOMER_CATEGORY')"
            label="Nouvelle catégorie"
            class="float-right"
            color="blue-10"
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
        <customerCategoryCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:deleteImage="deleteImage(recordToEdit.id)"
        ></customerCategoryCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_CUSTOMER_CATEGORY')"
            class="my-sticky-header-table no-border no-shadow"
            :dir="selectedLang.dir"
            title
            :pagination="initialPagination"
            :data="langData"
            :filter="filter"
            :columns="columns"
            :loading="!fetched"
            row-key="row_key"
            selection="multiple"
            :selected.sync="selected"
            :selected-rows-label="getSelectedString"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-name="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.name }}</div>
                <div class="text-caption text-grey-5">{{ props.row.description }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-activated="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <q-icon v-if="props.row.is_activated === 1" name="fas fa-eye" color="teal-13"/>
                <q-icon v-else name="fas fa-eye-slash" color="grey-6"/>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td
                auto-width
                style="border-right:4px solid #0d47a1"
                v-if="recordToEdit!==null && recordToEdit.id === props.row.id"
              >
                <q-btn flat round class="bg-grey-2 q-pa-xs" color="grey-6" size="xs">
                  <q-icon name="fas fa-trash" color="grey-9"/>
                </q-btn>
                <q-btn
                  flat
                  v-if="hasRole('PUT_CUSTOMER_CATEGORY')"
                  round
                  class="q-ml-xs bg-grey-2 q-pa-xs"
                  color="grey-6"
                  size="xs"
                  @click="setRecordToEdit(props.row.id); dialog= true"
                >
                  <q-icon name="fas fa-pen" color="grey-9"/>
                </q-btn>
              </q-td>
              <q-td v-else></q-td>
            </template>
          </q-table>

          <customerCategoryComponent
            v-if="hasRole('POST_CUSTOMER_CATEGORY') || hasRole('PUT_CUSTOMER_CATEGORY')"
            :categories="langData"
            :dialog="dialog"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></customerCategoryComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import customerCategoryComponent from 'components/customerCategoryComponent'
import customerCategoryCard from 'components/customerCategoryCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'customerCategoryPage',
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
          name: 'name',
          required: true,
          label: 'Catégorie',
          align: 'left',
          sortable: true
        },
        {
          name: 'activated',
          required: true,
          label: 'Activée',
          align: 'left',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          required: true
        }
      ]
    }
  },
  computed: {
    selectedLang () {
      return this.$store.getters['config/getSelectedLang']
    },
    langData () {
      const selectedLang = this.$store.getters['config/getSelectedLang']

      if (selectedLang) {
        const data = this.data.filter(el => el.lang_id === selectedLang.id)
        data.forEach(function (el, i) {
          el.row_key = i
        })
        return data
      }
      return []
    }
  },
  components: {
    customerCategoryComponent,
    customerCategoryCard,
    EmptyCard
  },
  mounted () {
    this.getCategories()
  },
  methods: {
    getCategories () {
      this.$axios.get('/customerCategory').then(res => {
        this.data = res.data
        this.fetched = true
      })
    },

    updateTableRows (data) {
      const index = this.data.findIndex(
        e => e.id === data.id
      )
      if (index !== -1) {
        this.data.splice(index, 1, data)
      } else {
        this.data.push(data)
      }
      this.setRecordToEdit(data.id)
      this.dialog = false
    },
    setRecordToEdit (id) {
      if (this.recordToEdit === null || this.dialog === true ||
      parseInt(this.recordToEdit.id) !== parseInt(id)) {
        this.$axios.get('customerCategory/' + id)
          .then(res => {
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
            this.langData.length
          }`
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
    }
  }
}
</script>
