<template>
  <q-expansion-item expand-separator header-class="bg-grey-1" label="SEO" caption="Referencement">
    <div class="col-12">
      <div class="row">
        <div v-for="l in langs" :key="l.id" :name="l.short_name" class="col-6">
          <q-card class="q-pa-xs no-shadow">
            <q-card-section>
              <div>
                <div class="text-caption q-pb-sm" :dir="l.dir">{{ l.full_name }}</div>
                <q-input
                  class="q-mb-sm"
                  filled
                  dense
                  v-model="fields[l.id].page_title"
                  type="text"
                  label="Titre de la page"
                />
                <q-input
                  class="q-mb-sm"
                  filled
                  dense
                  v-model="fields[l.id].meta_description"
                  type="textarea"
                  label="Méta description"
                />
                <q-input
                  class="q-mb-sm"
                  filled
                  dense
                  v-model="fields[l.id].meta_keywords"
                  type="text"
                  label="Méta Mots clé"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-expansion-item>
</template>
<script>
export default {
  props: ['fields', 'langs']
}
</script>
