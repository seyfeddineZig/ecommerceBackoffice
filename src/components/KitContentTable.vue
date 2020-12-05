<template>
  <div class="row">
    <div class="col-12">
      <div class="text-subtitle-1 q-mt-sm q-mb-sm">Contenu du kit</div>
      <q-table :data="kitContent" :columns="columns" row-key="name">
        <template v-slot:body-cell-code="props">
          <q-td>
            <div class="text-caption">{{ props.row.code }}</div>
          </q-td>
        </template>
        <template v-slot:body-cell-name="props">
          <q-td>
            <div class="text-caption text-overflow">
              {{ props.row.name }}
              <q-tooltip>{{ props.row.name }}</q-tooltip>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-qty="props">
          <q-td>
            <div class="text-caption text-grey-9">{{ props.row.qty }}</div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'KitContent',
  props: ['products', 'kitContent'],
  data () {
    return {
      columns: [
        {
          name: 'code',
          required: true,
          label: 'Code',
          align: 'left',
          field: row => row.code,
          format: val => `${val}`,
          sortable: true
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
          name: 'qty',
          align: 'left',
          label: 'Qté',
          field: row => row.real_qty,
          format: val => `${val}`,
          sortable: true
        }
      ]
    }
  }
}
</script>
