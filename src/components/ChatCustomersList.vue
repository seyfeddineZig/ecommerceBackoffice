<template>
  <q-list>
    <q-item-label header>Liste des clients</q-item-label>
    <q-item v-for="(c, i) in data" :key="i" clickable v-ripple @click="$emit('getCustomerMessages', c.id)">
      <q-item-section avatar>
        <q-avatar color="blue-10">
          <img v-if="c.image" :src="$axios.defaults.baseURL.replace('api', 'images') + c.image">
          <div v-else class="text-subtitle2 text-white">{{ c.last_name[0] }}</div>
        </q-avatar>
      </q-item-section>
      <q-item-section>{{ c.last_name + ' ' + c.first_name }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script>
export default {
  name: 'ChatCustomersList',
  props: ['data'],
  data () {
    return {}
  }
}
</script>
