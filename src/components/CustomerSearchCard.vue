<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
      <q-expansion-item expand-separator default-opened expand-icon-toggle label="Détail">

        <div class="row">
          <div class="col-12">
            <q-table
              class="my-sticky-header-table"
              flat
              dense
              separator="cell"
              bordered
              :data="selectedRow"
              :pagination="initialPagination"
              :columns="columns"
              binary-state-sort
            >
              <template v-slot:body-cell-client="props">
                <q-td>
                  <div class="text-caption">{{ props.row.last_name !== null ?
                    (props.row.last_name + ' ' + props.row.first_name ) : 'Visiteur'}}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-created_at="props">
                <q-td>
                  <div class="text-caption">
                    {{ props.row.created_at }}
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'inventoryCard',
  props: ['selectedRow'],
  data () {
    return {
      initialPagination: {
        page: 1,
        rowsPerPage: 1000
      },
      columns: [
        {
          name: 'client',
          required: true,
          label: 'Client',
          align: 'left'
        },
        {
          name: 'created_at',
          required: true,
          label: 'Date de recherche',
          align: 'left'
        }
      ]
    }
  },
  methods: {
    hasRole (role) {
      return this.$store.getters['config/hasRole'](role)
    }
  }
}
</script>
