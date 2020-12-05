<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Publicités</div>
          </q-toolbar-title>
          <div v-if="recordToEdit">
            <q-btn
              flat
              class="bg-red-1 q-ml-sm text-weight-bold q-pa-xs"
              color="red-8"
              size="sm"
              label="supprimer"
            />
            <q-btn
              flat
              class="q-ml-sm bg-grey-3 text-weight-bold q-pa-xs"
              color="grey-8"
              size="sm"
              label="modifier"
              @click="setRecordToEdit(recordToEdit.id); dialog= true"
            />
          </div>
          <q-btn
            v-if="hasRole('POST_PUB')"
            flat
            label="Nouveau"
            class="q-ml-sm bg-blue-2 q-pa-xs text-weight-bold"
            color="blue-10"
            @click="recordToEdit=null; dialog = true"
            size="sm"
          />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page>
          <q-table
            v-if="hasRole('GET_PUB')"
            class="my-sticky-header-table no-border no-shadow"
            :pagination="initialPagination"
            :data="data"
            :columns="columns"
            row-key="row_key"
            :loading="!fetched"
            :selected-rows-label="getSelectedString"
            :rows-per-page-label="'Lignes par page :'"
          >
            <template v-slot:body-cell-avatar="props">
              <q-td
                v-bind:class="[recordToEdit && recordToEdit.id === props.row.id ? 'bg-blue-1' : '', 'cursor-pointer']"
                @click="setRecordToEdit(props.row.id);"
              >
                <q-img
                  v-if="props.row.type === 'IMAGE'"
                  class="rounded-borders"
                  style="width: 200px"
                  :ratio="1"
                  :src="$axios.defaults.baseURL.replace('api', 'images') + props.row.image"
                ></q-img>
                <q-video
                  style="width: 200px"
                  v-if="props.row.type === 'VIDEO'"
                  :src="props.row.link"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-position="props">
              <q-td
                v-bind:class="[recordToEdit && recordToEdit.id === props.row.id ? 'bg-blue-1' : '', 'cursor-pointer']"
                @click="setRecordToEdit(props.row.id);"
              >{{ getPosition(props.row.position) }}</q-td>
            </template>
          </q-table>
          <PubComponent
            v-if="hasRole('POST_PUB') || hasRole('PUT_PUB')"
            :dialog="dialog"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></PubComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import PubComponent from 'components/PubComponent'

export default {
  name: 'PubPage',
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
      columns: [
        {
          name: 'avatar',
          label: 'Image/Video',
          align: 'left',
          required: true
        },
        {
          name: 'position',
          label: 'position',
          align: 'left',
          required: true
        }
      ]
    }
  },
  components: {
    PubComponent
  },
  mounted () {
    this.getPubs()
  },
  methods: {
    getPosition (p) {
      const positions = [
        { label: 'En haut', name: 'TOP' },
        { label: 'En bas', name: 'BOTTOM' },
        { label: 'à gauche', name: 'LEFT' },
        { label: 'à droite', name: 'RIGHT' },
        { label: 'dans le slide', name: 'CAROUSEL' }
      ]
      return positions.find(el => el.name === p).label
    },
    getPubs () {
      this.$axios.get('/pub').then(res => {
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
        this.$axios.get('pub/' + id).then(res => {
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
    }
  }
}
</script>
