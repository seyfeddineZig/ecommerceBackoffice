<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Caractéristiques</div>
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
            v-if="hasRole('POST_ATTRIBUTE')"
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
        <AttributeCard
          v-if="recordToEdit !== null && !dialog"
          :selectedRow="recordToEdit"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
        ></AttributeCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_ATTRIBUTE')"
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
            <template v-slot:top-left>
              <div
                class="text-caption"
              >Champs supplémentaires de détails produits (qui seront affichés dans la vitrine) pour fournir des informations supplémentaires sur le produit à vos clients</div>
            </template>
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter">
                <q-icon slot="append" name="search"/>
              </q-input>
            </template>

            <template v-slot:body-cell-name="props">
              <q-td v-bind:class="getTdStyle(props.row)" @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ props.row.name }}</div>
                <div class="text-caption text-grey-6">{{ props.row.description }}</div>
              </q-td>
            </template>
          </q-table>

          <AttributeComponent
            v-if="hasRole('POST_ATTRIBUTE') || hasRole('PUT_ATTRIBUTE')"
            :dialog="dialog"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></AttributeComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import AttributeComponent from 'components/AttributeComponent'
import AttributeCard from 'components/AttributeCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'AttributePage',
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
          label: 'Attribut',
          align: 'left',
          sortable: true
        }
      ]
    }
  },
  components: {
    AttributeComponent,
    AttributeCard,
    EmptyCard
  },
  mounted () {
    this.getAttributes()
  },
  methods: {
    getAttributes () {
      this.$axios.get('/attribute').then(res => {
        this.data = res.data.attributes
        this.fetched = true
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
    setRecordToEdit (id) {
      if (
        this.recordToEdit === null ||
        this.dialog === true ||
        parseInt(this.recordToEdit.id) !== parseInt(id)
      ) {
        this.$axios.get('attribute/' + id).then(res => {
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
