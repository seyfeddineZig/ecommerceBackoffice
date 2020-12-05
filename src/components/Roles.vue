<template>
  <q-card class="my-card bg-transparent" bordered>
    <q-card-section class="text-subtitle1 text-weight-bold">
      Permissions
    </q-card-section>
    <q-card-section v-for="(g,i) in roles" :key="i">
      <div class="text-subtitle2">{{ g.group }}</div>
      <div>
        <q-toggle :disable="disable" v-for="(r,j) in g.roles" :key="j" v-model="r.checked" color="blue-10" size="sm" :label="r.description"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  props: ['roles', 'disable'],
  name: 'RolesCard',
  data () {
    return {}
  }
}
</script>
