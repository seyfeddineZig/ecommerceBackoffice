<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">
        <q-img
          v-if="selectedRow.image"
          class="rounded-borders q-mt-dm q-mb-sm"
          :src="$axios.defaults.baseURL.replace('api', 'images')+selectedRow.image"
        >
          <div class="absolute-bottom-right bg-transparent">
            <q-btn
              color="grey-1"
              class="text-grey-10"
              icon="fas fa-trash"
              label="Supprimer l'image"
              size="xs"
              @click="$emit('deleteImage')"
            />
          </div>
        </q-img>
        <div
          v-else
          class="text-subtitle2 text-center q-pa-md bg-grey-2 q-mt-dm q-mb-sm"
        ><q-icon name="far fa-image" size="80px" color="grey-4" /></div>

        <q-input class="q-mt-dm q-mb-sm" filled v-model="defaultLang.name" label="Désignation" dense readonly/>
        <q-input
          class="q-mt-dm q-mb-sm"
          filled
          v-model="defaultLang.description"
          label="Description"
          type="textarea"
          dense
          readonly
        />

        <div class="text-caption q-mt-dm q-mb-sm">Afficher sur le site ?</div>
        <q-icon v-if="selectedRow.is_activated === 1" name="fas fa-eye" color="teal-13"/>
        <q-icon v-else name="fas fa-eye-slash" color="grey-6"/>
    </q-card-section>
    <q-separator/>
    <CardUserUpdatesInfo :selectedRow="selectedRow"></CardUserUpdatesInfo>
    <q-separator/>
    <CardSEOInfo :selectedRow="selectedRow"></CardSEOInfo>
  </q-card>
</template>

<script>
import CardUserUpdatesInfo from './CardUserUpdatesInfo'
import CardSEOInfo from './CardSEOInfo'
export default {
  name: 'productCategoryCard',
  props: ['selectedRow'],
  data () {
    return {}
  },
  components: { CardUserUpdatesInfo, CardSEOInfo },
  computed: {
    defaultLang () {
      return this.selectedRow.fields.find(el => el.lang_id === 1)
    }
  }
}
</script>
