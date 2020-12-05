<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Utilisateurs</div>
          </q-toolbar-title>
          <q-btn
            v-if="hasRole('POST_USER')"
            label="Nouvel utilisateur"
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
        :width="400"
        :breakpoint="400"
        content-class="bg-grey-1"
      >
        <UserCard
          v-if="recordToEdit !== null && !dialog"
          :recordToEdit="recordToEdit"
          :groupName="groupName(recordToEdit.user_group_id)"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:deleteImage="deleteImage(recordToEdit.id)"
        ></UserCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_USER')"
            class="my-sticky-header-table no-border no-shadow"
            :dir="selectedLang.dir"
            title
            :pagination="initialPagination"
            :data="data"
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
                <div class="text-caption text-weight-bold">{{ props.row.first_name + ' ' + props.row.last_name}}</div>
                <div class="text-caption text-grey-5 text-overflow">
                  {{ props.row.email }}
                  <q-tooltip>{{ props.row.email }}</q-tooltip>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-group="props">
              <q-td @click="setRecordToEdit(props.row.id);">
                <div class="text-caption text-weight-bold">{{ groupName(props.row.user_group_id) }}</div>
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td
                auto-width
                v-bind:style="{'border-right': recordToEdit !== null && parseInt(recordToEdit.id) === parseInt(props.row.id) && selectedLang.dir === 'ltr' ? '4px solid #0d47a1' : '',
                'border-left': recordToEdit !== null && parseInt(recordToEdit.id) === parseInt(props.row.id) && selectedLang.dir === 'rtl' ? '4px solid #0d47a1' : ''}"
              >
                <q-btn
                  v-if="props.row.id !== 1"
                  flat
                  round
                  class="bg-grey-2 q-pa-xs"
                  color="grey-6"
                  size="xs"
                >
                  <q-icon name="fas fa-trash" color="grey-9"/>
                </q-btn>
                <q-btn
                  flat
                  v-if="hasRole('PUT_USER')"
                  round
                  class="q-ml-xs bg-grey-2 q-pa-xs"
                  color="grey-6"
                  size="xs"
                  @click="setRecordToEdit(props.row.id); dialog= true"
                >
                  <q-icon name="fas fa-pen" color="grey-9"/>
                </q-btn>
              </q-td>
            </template>
          </q-table>

          <UserComponent
            v-if="hasRole('POST_USER') || hasRole('PUT_USER')"
            :dialog="dialog"
            :groups="groups"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></UserComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import UserComponent from 'components/UserComponent'
import UserCard from 'components/UserCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'UserPage',
  data () {
    return {
      drawerRight: true,
      dialog: false,
      recordToEdit: null,
      data: [],
      groupRoles: [],
      roles: [],
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
          label: 'Utilisateur',
          align: 'left',
          sortable: true
        },
        {
          name: 'group',
          required: true,
          label: 'Groupe',
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
    }
  },
  components: {
    UserComponent,
    UserCard,
    EmptyCard
  },
  mounted () {
    this.getUsers()
  },
  methods: {
    getUsers () {
      this.$axios.get('/user').then(res => {
        this.data = res.data.users
        this.groups = res.data.user_groups.map(obj => ({
          ...obj,
          label: obj.name
        }))
        this.fetched = true
      })
    },
    groupName (id) {
      const group = this.groups.find(el => parseInt(el.id) === parseInt(id))
      return group ? group.name : ''
    },

    updateTableRows (data) {
      const index = this.data.findIndex(el => parseInt(el.id) === parseInt(data.id))
      if (index !== -1) {
        this.data.splice(index, 1, data)
      } else {
        this.data.unshift(data)
      }
      this.dialog = false
    },
    setRecordToEdit (id) {
      this.recordToEdit = this.data.find(res => parseInt(res.id) === parseInt(id))
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
      const i = this.selected.findIndex(el => parseInt(el.id) === parseInt(row.id))

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
