<template>
  <q-card class="my-card bg-transparent no-shadow">
    <q-card-section class="q-pt-xs q-gutter-xs">

        <q-input class="q-mt-sm q-mb-sm" filled v-model="defaultLang.name" label="Désignation" dense readonly/>
        <q-input
        class="q-mt-sm q-mb-sm"
          filled
          v-model="defaultLang.description"
          label="Description"
          type="textarea"
          dense
          readonly
        />
        <div>
          <div class="text-caption q-mt-sm q-mb-sm ">Valeurs de la caracteristique</div>
          <q-chip
            v-for="(a, i) in selectedRow.attributeValues.filter(el => el.lang_id === 1) "
            :key="i"
            :label="selectedRow.type === 'TEXT' ? a.name : ''"
          >
            <q-avatar
              v-if="selectedRow.type === 'COLOR'"
              v-bind:style="{'background': a.name}"
              text-color="white"
            ></q-avatar>
          </q-chip>
        </div>

        <div class="text-caption q-mt-sm q-mb-sm">Afficher sur le site ?</div>
        <q-icon v-if="selectedRow.is_activated === 1" name="fas fa-eye" color="teal-13"/>
        <q-icon v-else name="fas fa-eye-slash" color="grey-6"/>
    </q-card-section>
    <q-separator/>
        <CardUserUpdatesInfo :selectedRow="selectedRow"></CardUserUpdatesInfo>
  </q-card>
</template>

<script>
import CardUserUpdatesInfo from './CardUserUpdatesInfo'
export default {
  name: 'AttributeCard',
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
