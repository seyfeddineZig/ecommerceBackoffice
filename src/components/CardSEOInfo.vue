<template>
  <q-card-section class="q-gutter-xs">
    <q-expansion-item expand-separator expand-icon-toggle label="SEO" caption="Réferencement">
      <div class="row">
        <div class="col-12 q-pa-xs">
          <q-input
            standout
            v-model="selectedRow.fields[0].page_title"
            label="Titre de la page"
            dense
            readonly
          />
        </div>
        <div class="col-12 q-pa-xs">
          <q-input
            standout
            v-model="selectedRow.fields[0].meta_description"
            label="Méta description"
            type="textarea"
            dense
            readonly
          />
        </div>
        <div class="col-12 q-pa-xs">
          <q-input
            standout
            v-model="selectedRow.fields[0].meta_keywords"
            label="Méta mots clé"
            dense
            readonly
          />
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
