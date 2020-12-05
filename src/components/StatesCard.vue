<template>
  <q-expansion-item expand-separator expand-icon-toggle dense-toggle >
    <template v-slot:header>
        <q-item-section>
        <div class="text-subtitle2 text-weight-bold">Etat</div>
          <q-badge :color="current.color" text-color="white" class="q-pa-sm" :label="current.name" />
        </q-item-section>
    </template>
    <q-list>
      <q-separator horizontal/>
      <q-item-label header><div class="text-subtitle2 text-weight-2">Journal des états</div></q-item-label>
      <q-item v-ripple v-for="(s, i) in states" :key="i">
        <q-item-section avatar>
          <q-badge class="q-pa-xs" :color="s.color" text-color="white" :label="s.name" />
        </q-item-section>
        <q-item-section class="text-caption text-grey-8">
          {{ s.created_at }}
          <div>Modifié par : {{ s.user }}</div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-expansion-item>
</template>

<script>
export default {
  name: 'StatesCard',
  props: ['states', 'current'],
  data () {
    return {}
  }
}
</script>
