<template>
  <q-page v-if="data">
    <q-layout view="lhh LpR lff" container class="bg-white window-height">
      <q-header class="bg-white" bordered>
        <q-toolbar>
          <q-toolbar-title>
            <div class="text-subtitle1 text-grey-10 text-weight-bold">Groupes des utilisateurs</div>
          </q-toolbar-title>
          <q-btn
            v-if="hasRole('POST_USER_GROUP')"
            label="Nouveau groupe"
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
        :width="700"
        :breakpoint="700"
        content-class="bg-grey-1"
      >
        <UserGroupCard
          v-if="recordToEdit !== null && !dialog"
          :recordToEdit="recordToEdit"
          :roles="getGroupRoles"
          v-on:editRecord="setRecordToEdit(recordToEdit.id); dialog= true"
          v-on:deleteImage="deleteImage(recordToEdit.id)"
        ></UserGroupCard>
        <EmptyCard v-else></EmptyCard>
      </q-drawer>
      <q-page-container>
        <q-page class>
          <q-table
            v-if="hasRole('GET_USER_GROUP')"
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
                <div class="text-caption text-weight-bold">{{ props.row.name }}</div>
                <div class="text-caption text-grey-5 text-overflow">
                  {{ props.row.description }}
                  <q-tooltip>{{ props.row.description }}</q-tooltip>
                </div>
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
                  v-if="hasRole('PUT_USER_GROUP')"
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

          <UserGroupComponent
            v-if="hasRole('POST_USER_GROUP') || hasRole('PUT_USER_GROUP')"
            :dialog="dialog"
            :roles="getGroupRoles"
            v-on:closeDialog="dialog=false"
            v-on:updateTableRows="updateTableRows"
            :recordToEdit="recordToEdit"
          ></UserGroupComponent>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import UserGroupComponent from 'components/UserGroupComponent'
import UserGroupCard from 'components/UserGroupCard'
import EmptyCard from 'components/EmptyCard'

export default {
  name: 'UserGroupPage',
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
    },
    getGroupRoles () {
      const roles = []
      if (this.roles) {
        this.roles.forEach(el => {
          const i = roles.findIndex(e => e.group === el.group)
          if (this.recordToEdit) {
            el.checked =
              this.recordToEdit.roles.findIndex(
                e => e.user_role_id === el.id
              ) !== -1
          } else {
            el.checked = false
          }

          if (i === -1) {
            roles.push({
              group: el.group,
              roles: [el]
            })
          } else {
            roles[i].roles.push(el)
          }
        })
      }
      return roles
    }
  },
  components: {
    UserGroupComponent,
    UserGroupCard,
    EmptyCard
  },
  mounted () {
    this.getUserGroups()
  },
  methods: {
    getUserGroups () {
      this.$axios.get('/userGroup').then(res => {
        this.data = res.data.user_groups
        this.groupRoles = res.data.user_group_roles
        this.roles = res.data.user_roles.map(obj => ({
          ...obj,
          checked: false
        }))
        this.fetched = true
      })
    },

    updateTableRows (data) {
      const index = this.data.findIndex(el => el.id === data.id)
      if (index !== -1) {
        this.data.splice(index, 1, data)
      } else {
        this.data.unshift(data)
      }
      this.groupRoles = this.groupRoles
        .filter(el => el.user_group_id !== data.id)
        .concat(
          data.roles.map(e => ({
            user_role_id: e,
            user_group_id: data.id
          }))
        )
      this.dialog = false
    },
    setRecordToEdit (id) {
      this.recordToEdit = this.data.find(res => res.id === id)
      this.recordToEdit.roles = this.groupRoles.filter(
        el => el.user_group_id === id
      )
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
