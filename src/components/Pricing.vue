<template>
  <div class="row q-pa-sm">

    <div v-for="p in pricing" :key="p.category_id" class="col q-pa-sm">
      <q-input
        dense
        filled
        v-model="p.price"
        reverse-fill-mask
        fill-mask="0"
        :label="p.name"
        suffix="DZD"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: ['pricing']
}
</script>
