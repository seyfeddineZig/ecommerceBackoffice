<template>
  <q-expansion-item v-if="customer" expand-separator expand-icon-toggle dense-toggle>
    <template v-slot:header>

        <q-item-section v-if="customer.image" avatar>
          <q-avatar>
            <img :src="$axios.defaults.baseURL.replace('api', 'images') + customer.image">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <div class="text-subtitle2 text-weight-bold">Client</div>
          {{ customer.last_name + ' ' + customer.first_name }}
          </q-item-section>
    </template>
    <div class="row q-pa-md">
      <q-separator horizontal />
      <div class="col-6 q-pa-sm">
        <q-input
          class="q-mt-dm q-mb-sm"
          borderless
          v-model="customer.email"
          label="Email"
          dense
          readonly
        />
      </div>
      <div class="col-6 q-pa-sm">
        <q-input
          class="q-mt-dm q-mb-sm"
          borderless
          v-model="customer.phone"
          label="Téléphone"
          dense
          readonly
        />
      </div>
      <div class="col-6 q-pa-sm">
        <q-input
          class="q-mt-dm q-mb-sm"
          borderless
          v-model="customer.activity"
          label="Activité"
          dense
          readonly
        />
      </div>
      <div class="col-6 q-pa-sm">
        <q-input
          class="q-mt-dm q-mb-sm"
          borderless
          v-model="customer.category"
          label="Catégorie"
          dense
          readonly
        />
      </div>
    </div>
  </q-expansion-item>
</template>

<script>
export default {
  name: 'CustomerCard2',
  props: ['customer'],
  data () {
    return {}
  }
}
</script>
