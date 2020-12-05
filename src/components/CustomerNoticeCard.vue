<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
      <q-expansion-item expand-separator default-opened expand-icon-toggle label="Détail">
        <div class="row">
          <div class="col text-right q-mt-xs q-mb-xs">
            <q-btn flat round class="bg-grey-2 q-pa-xs" color="grey-6" size="xs">
              <q-icon name="fas fa-trash" color="grey-9"/>
            </q-btn>
            <q-btn
              v-if="selectedRow.is_approved === 0"
              flat
              class="bg-blue-2 q-ml-xs q-pa-xs"
              color="blue-10"
              size="xs"
              @click="$emit('setNoticeState')"
            >Approuver</q-btn>
            <q-btn
              v-if="selectedRow.is_approved === 1"
              flat
              class="bg-red-2 q-ml-xs q-pa-xs"
              color="red-8"
              size="xs"
              @click="$emit('setNoticeState')"
            >Désapprouver</q-btn>
          </div>
        </div>
        <q-field dense filled label="Client" stack-label readonly>
          <template v-slot:control>
            <div
              class="self-center full-width no-outline"
            >{{selectedRow.last_name + ' ' + selectedRow.first_name}}</div>
          </template>
        </q-field>
        <q-input
          filled
          class="q-mt-sm q-mb-sm"
          v-model="selectedRow.product_name"
          label="Produit"
          dense
          readonly
        />

        <q-input
          filled
          class="q-mt-sm q-mb-sm"
          v-model="selectedRow.notice"
          label="Avis"
          type="textarea"
          dense
          readonly
        />
        <div class="text-weight-bold text-teal" v-if="selectedRow.is_approved === 1">Approuvé</div>
        <div class="text-weight-bold text-red" v-else>Non approuvé</div>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'customerNoticeCard',
  props: ['selectedRow'],
  data () {
    return {}
  }
}
</script>
