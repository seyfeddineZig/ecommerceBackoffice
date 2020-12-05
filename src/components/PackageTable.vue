<template>
  <q-table :data="productPackages" :columns="packageColumns" row-key="name">
    <template v-slot:body-cell-name="props">
      <q-td>
        <div class="text-caption text-overflow">
          {{ props.row.name }}
          <q-icon v-if="props.row.is_default_package === 1"
           color="blue-10" name="far fa-star" />
          <q-tooltip>{{ props.row.name }}</q-tooltip>
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-qty="props">
      <q-td class="bg-grey-2">
        <div class="text-caption text-grey-9">{{ props.row.qty }}</div>
      </q-td>
    </template>
    <template v-slot:body-cell-amount="props">
      <q-td>
        <div
          class="text-caption text-grey-9"
          v-html="getPackageAmount( props.row.customer_category_id )"
        ></div>
      </q-td>
    </template>
    <template v-if="actions" v-slot:body-cell-actions="props">
      <q-td style="width: 50px">
        <q-btn
          v-if="props.row.id !== undefined"
          flat
          round
          class="bg-grey-2 q-pa-xs"
          color="grey-6"
          size="xs"
          @click="$emit('deleteRow', props.row.product_id)"
        >
          <q-icon name="fas fa-trash" color="grey-9"/>
        </q-btn>
        <q-btn
          v-if="props.row.id !== undefined"
          flat
          round
          class="q-ml-xs bg-grey-2 q-pa-xs"
          color="grey-6"
          size="xs"
          @click="$emit('editPackage', props.row.id)"
        >
          <q-icon name="fas fa-pen" color="grey-9"/>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script>
export default {
  name: 'PackageTable',
  props: ['productPackages', 'pricing', 'actions'],
  data () {
    return {
      packageColumns: [
        {
          name: 'name',
          required: true,
          label: 'Colis',
          align: 'left',
          field: row => row.name,
          format: val => `${val}`,
          sortable: true
        },
        {
          name: 'qty',
          align: 'left',
          label: 'Qté',
          field: row => row.qty,
          format: val => `${val}`,
          sortable: true
        },
        { name: 'amount', label: 'Prix de vente', align: 'left' },
        { name: 'actions', label: 'Actions', align: 'left' }
      ]
    }
  },
  methods: {
    getPackageAmount (customerCategoryId) {
      const pricing = this.pricing.find(el => el.id === customerCategoryId)
      if (pricing) {
        return pricing.name +
        '<div class="text-blue-10 text-weight-bold">' +
        pricing.price.toFixed(2) +
        ' DZD</div>'
      }
    }
  }
}
</script>
