<template>
  <q-card-section class="q-gutter-xs">
    <q-expansion-item expand-separator expand-icon-toggle label="Autres">
      <div class="row">
        <div class="col-6 q-pa-xs">
          <q-input standout v-model="selectedRow.created_at" label="Créé le" dense readonly/>
        </div>
        <div class="col-6 q-pa-xs">
          <q-input standout v-model="selectedRow.created_by" label="par" dense readonly/>
        </div>
        <div class="col-6 q-pa-xs">
          <q-input
            standout
            v-model="selectedRow.updated_at"
            label="Dernière modification"
            dense
            readonly
          />
        </div>
        <div class="col-6 q-pa-xs">
          <q-input standout v-model="selectedRow.updated_by" label="par" dense readonly/>
        </div>
      </div>
    </q-expansion-item>
  </q-card-section>
</template>
<script>
export default {
  props: ['selectedRow']
}
</script>
