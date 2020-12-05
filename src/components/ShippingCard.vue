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
              flat
              round
              class="q-ml-xs bg-grey-2 q-pa-xs"
              color="grey-6"
              size="xs"
              @click="$emit('editRecord')"
            >
              <q-icon name="fas fa-pen" color="grey-9"/>
            </q-btn>
          </div>
        </div>
        <q-input class="q-mt-dm q-mb-sm" filled v-model="defaultLang.name" label="Région" dense readonly/>
        <q-input
          class="q-mt-dm q-mb-sm"
          filled
          v-model="selectedRow.code"
          label="Code"
          type="text"
          dense
          readonly
        />
        <q-input
          class="q-mt-dm q-mb-sm"
          filled
          v-model="selectedRow.amount"
          label="Tarif"
          type="text"
          dense
          readonly
        />

        <div class="text-caption q-mt-dm q-mb-sm">Afficher sur le site ?</div>
        <q-icon v-if="selectedRow.is_activated === 1" name="fas fa-eye" color="teal-13"/>
        <q-icon v-else name="fas fa-eye-slash" color="grey-6"/>
      </q-expansion-item>
    </q-card-section>
    <q-separator/>
    <CardUserUpdatesInfo :selectedRow="selectedRow"></CardUserUpdatesInfo>
  </q-card>
</template>

<script>
import CardUserUpdatesInfo from './CardUserUpdatesInfo'
export default {
  name: 'shippingCard',
  props: ['selectedRow'],
  data () {
    return {}
  },
  components: { CardUserUpdatesInfo },
  computed: {
    defaultLang () {
      return this.selectedRow.fields.find(el => el.lang_id === 1)
    }
  }
}
</script>
